package com.uyirgene.course;

import com.uyirgene.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    Optional<Enrollment> findByUserAndFlagshipProgram(User user, FlagshipProgram flagshipProgram);
    List<Enrollment> findByUser(User user);
    List<Enrollment> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    void deleteByCourse(Course course);

    /** Find enrollment by Razorpay order ID — used by webhook to confirm payment. */
    Optional<Enrollment> findByPaymentOrderId(String paymentOrderId);

    /** Check if user is enrolled in a specific course with a given status. */
    boolean existsByUserAndCourseAndStatusIn(User user, Course course, List<Enrollment.Status> statuses);

    /** Check if user has any enrollment via any of the given bundle IDs. */
    boolean existsByUserAndBundle_IdInAndStatusIn(User user, List<Long> bundleIds, List<Enrollment.Status> statuses);

    /** Check if user is enrolled in a flagship program with a given status. */
    boolean existsByUserAndFlagshipProgramAndStatusIn(User user, FlagshipProgram flagshipProgram, List<Enrollment.Status> statuses);

    /** Returns all course enrollments eligible for a completion reminder:
     *  course has reminderDays set, status is ENROLLED, reminder not yet sent. */
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.user JOIN FETCH e.course c " +
           "WHERE e.course IS NOT NULL AND c.reminderDays IS NOT NULL " +
           "AND e.status = :status AND e.reminderSentAt IS NULL")
    List<Enrollment> findPendingReminders(@Param("status") Enrollment.Status status);

    /** Returns all flagship enrollments eligible for a completion reminder:
     *  flagship program has reminderDays set, status is ENROLLED, reminder not yet sent. */
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.user JOIN FETCH e.flagshipProgram fp " +
           "WHERE e.flagshipProgram IS NOT NULL AND fp.reminderDays IS NOT NULL " +
           "AND e.status = :status AND e.reminderSentAt IS NULL")
    List<Enrollment> findPendingFlagshipReminders(@Param("status") Enrollment.Status status);
}