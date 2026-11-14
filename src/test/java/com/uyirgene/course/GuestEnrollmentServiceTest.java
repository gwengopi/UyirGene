package com.uyirgene.course;

import com.uyirgene.course.payment.PaymentProvider;
import com.uyirgene.course.payment.dto.PaymentContactDetails;
import com.uyirgene.exception.PaymentException;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import com.uyirgene.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Confirm-time checks for guest/anonymous payments: the paid order must belong to the item
 * being confirmed (matched by the order receipt) and a stale pending row must not block it.
 */
public class GuestEnrollmentServiceTest {

    private static final String EMAIL = "buyer@example.com";
    private static final String ORDER = "order_NEW";
    private static final String PAYMENT = "pay_1";
    private static final String SIG = "sig";

    private EnrollmentRepository enrollmentRepo;
    private CourseRepository courseRepo;
    private FlagshipProgramRepository flagshipRepo;
    private UserService userService;
    private PaymentProvider paymentProvider;
    private MailService mailService;
    private GuestEnrollmentService service;

    private User user;
    private Course course2;
    private FlagshipProgram program5;

    @BeforeEach
    void setUp() {
        enrollmentRepo = Mockito.mock(EnrollmentRepository.class);
        courseRepo = Mockito.mock(CourseRepository.class);
        flagshipRepo = Mockito.mock(FlagshipProgramRepository.class);
        userService = Mockito.mock(UserService.class);
        paymentProvider = Mockito.mock(PaymentProvider.class);
        mailService = Mockito.mock(MailService.class);

        // Constructor order matches the field declaration order of GuestEnrollmentService.
        service = new GuestEnrollmentService(
                enrollmentRepo,
                Mockito.mock(UserRepository.class),
                courseRepo,
                Mockito.mock(CoursePriceRepository.class),
                flagshipRepo,
                Mockito.mock(FlagshipProgramPriceRepository.class),
                userService,
                paymentProvider,
                mailService,
                Mockito.mock(CourseBundleService.class),
                Mockito.mock(EnrollmentService.class));

        user = User.builder().id(1L).email(EMAIL).name("Buyer").build();
        course2 = Course.builder().id(2L).title("Auditor You tube").build();
        program5 = FlagshipProgram.builder().id(5L).title("Program").build();

        Mockito.when(userService.findOrCreateGuestUser(Mockito.any(), Mockito.eq(EMAIL), Mockito.any())).thenReturn(user);
        Mockito.when(courseRepo.findById(2L)).thenReturn(Optional.of(course2));
        Mockito.when(flagshipRepo.findById(5L)).thenReturn(Optional.of(program5));
        Mockito.when(paymentProvider.verifySignature(ORDER, PAYMENT, SIG)).thenReturn(true);
        Mockito.when(enrollmentRepo.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));
    }

    private Enrollment pendingRow(String orderId) {
        return Enrollment.builder().user(user).course(course2)
                .status(Enrollment.Status.PENDING).paymentOrderId(orderId).build();
    }

    // ---------- confirmGuestCoursePayment ----------

    @Test
    void guestConfirm_noRow_receiptMatches_enrolls() {
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.empty());
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-2");

        Enrollment e = service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG);

        assertThat(e.getStatus()).isEqualTo(Enrollment.Status.ENROLLED);
        assertThat(e.getPaymentOrderId()).isEqualTo(ORDER);
    }

    @Test
    void guestConfirm_orderForAnotherCourse_isRejected() {
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.empty());
        // Paid for a cheap course 25, now being confirmed against course 2
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-25");

        assertThatThrownBy(() -> service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("does not match");
        Mockito.verify(enrollmentRepo, Mockito.never()).save(Mockito.any());
    }

    @Test
    void guestConfirm_staleRowWithOtherOrder_receiptMatches_enrollsAndUpdatesOrder() {
        // The bug seen in testing: an old pending row with a different order id blocked a valid payment
        Enrollment stale = pendingRow("order_OLD");
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.of(stale));
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-2");

        Enrollment e = service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG);

        assertThat(e.getStatus()).isEqualTo(Enrollment.Status.ENROLLED);
        assertThat(e.getPaymentOrderId()).isEqualTo(ORDER);
    }

    @Test
    void guestConfirm_staleRowWithOtherOrder_receiptForAnotherCourse_isRejected() {
        Enrollment stale = pendingRow("order_OLD");
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.of(stale));
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-9");

        assertThatThrownBy(() -> service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG))
                .isInstanceOf(PaymentException.class);
        assertThat(stale.getStatus()).isEqualTo(Enrollment.Status.PENDING);
    }

    @Test
    void guestConfirm_rowRecordsThisOrder_enrollsWithoutReceiptLookup() {
        // guest-modal flow: the order is recorded on the pending row, so no Razorpay lookup is needed
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.of(pendingRow(ORDER)));

        Enrollment e = service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG);

        assertThat(e.getStatus()).isEqualTo(Enrollment.Status.ENROLLED);
        Mockito.verify(paymentProvider, Mockito.never()).fetchOrderReceipt(Mockito.any());
    }

    @Test
    void guestConfirm_receiptUnavailable_failsClosed() {
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.empty());
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn(null);

        assertThatThrownBy(() -> service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("verify");
        Mockito.verify(enrollmentRepo, Mockito.never()).save(Mockito.any());
    }

    @Test
    void guestConfirm_invalidSignature_isRejectedBeforeAnyLookup() {
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.empty());
        Mockito.when(paymentProvider.verifySignature(ORDER, PAYMENT, "bad")).thenReturn(false);

        assertThatThrownBy(() -> service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, "bad"))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("signature");
        Mockito.verify(paymentProvider, Mockito.never()).fetchOrderReceipt(Mockito.any());
    }

    @Test
    void guestConfirm_alreadyEnrolled_isIdempotent() {
        Enrollment done = pendingRow("order_OLD");
        done.setStatus(Enrollment.Status.ENROLLED);
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.of(done));

        Enrollment e = service.confirmGuestCoursePayment(EMAIL, 2L, PAYMENT, ORDER, SIG);

        assertThat(e).isSameAs(done);
        Mockito.verify(paymentProvider, Mockito.never()).fetchOrderReceipt(Mockito.any());
    }

    // ---------- confirmAnonymousCourseOrder ----------

    private void payerEmailIs(String email) {
        Mockito.when(paymentProvider.fetchPaymentDetails(PAYMENT))
                .thenReturn(new PaymentContactDetails(email, "+10000000", "Buyer", 15000L, "USD"));
    }

    @Test
    void anonConfirm_receiptMatches_enrolls() {
        payerEmailIs(EMAIL);
        Mockito.when(enrollmentRepo.findByUserAndCourse(user, course2)).thenReturn(Optional.empty());
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-2");

        Enrollment e = service.confirmAnonymousCourseOrder(2L, PAYMENT, ORDER, SIG);

        assertThat(e.getStatus()).isEqualTo(Enrollment.Status.ENROLLED);
        assertThat(e.getPaymentOrderId()).isEqualTo(ORDER);
    }

    @Test
    void anonConfirm_orderForAnotherCourse_isRejected() {
        payerEmailIs(EMAIL);
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-25");

        assertThatThrownBy(() -> service.confirmAnonymousCourseOrder(2L, PAYMENT, ORDER, SIG))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("does not match");
        Mockito.verify(enrollmentRepo, Mockito.never()).save(Mockito.any());
    }

    @Test
    void anonConfirm_courseOrderCannotBeUsedForAProgram() {
        payerEmailIs(EMAIL);
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-course-2");

        assertThatThrownBy(() -> service.confirmAnonymousFlagshipOrder(5L, PAYMENT, ORDER, SIG))
                .isInstanceOf(PaymentException.class);
        Mockito.verify(enrollmentRepo, Mockito.never()).save(Mockito.any());
    }

    // ---------- confirmGuestFlagshipPayment ----------

    @Test
    void guestFlagshipConfirm_orderForAnotherProgram_isRejected() {
        Mockito.when(enrollmentRepo.findByUserAndFlagshipProgram(user, program5)).thenReturn(Optional.empty());
        Mockito.when(paymentProvider.fetchOrderReceipt(ORDER)).thenReturn("anon-flagship-7");

        assertThatThrownBy(() -> service.confirmGuestFlagshipPayment(EMAIL, 5L, PAYMENT, ORDER, SIG))
                .isInstanceOf(PaymentException.class)
                .hasMessageContaining("does not match");
        Mockito.verify(enrollmentRepo, Mockito.never()).save(Mockito.any());
    }
}
