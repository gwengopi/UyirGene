package com.uyirgene.config;

import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository repository;

    /**
     * Get all active FAQs grouped by category
     */
    @Cacheable(value = "faqs", key = "'all'")
    public Map<String, List<Faq>> getAllFaqsGrouped() {
        List<Faq> faqs = repository.findByActiveTrueOrderByCategoryAscDisplayOrderAsc();
        return faqs.stream().collect(Collectors.groupingBy(
            Faq::getCategory,
            LinkedHashMap::new,
            Collectors.toList()
        ));
    }

    /**
     * Get all active FAQs as a flat list
     */
    @Cacheable(value = "faqs", key = "'list'")
    public List<Faq> getAllFaqs() {
        return repository.findByActiveTrueOrderByCategoryAscDisplayOrderAsc();
    }

    /**
     * Get FAQs by category
     */
    @Cacheable(value = "faqs", key = "'category:' + #category")
    public List<Faq> getFaqsByCategory(String category) {
        return repository.findByCategoryAndActiveTrueOrderByDisplayOrderAsc(category.toUpperCase());
    }

    /**
     * Get all FAQs for admin (including inactive)
     */
    public List<Faq> getAllFaqsAdmin() {
        return repository.findAll();
    }

    /**
     * Get FAQ by ID
     */
    public Faq getFaqById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ not found"));
    }

    /**
     * Create a new FAQ
     */
    @Transactional
    @CacheEvict(value = "faqs", allEntries = true)
    public Faq createFaq(Faq faq) {
        // Validate category
        validateCategory(faq.getCategory());

        // Set display order if not provided
        if (faq.getDisplayOrder() == null || faq.getDisplayOrder() == 0) {
            Integer maxOrder = repository.findMaxDisplayOrderByCategory(faq.getCategory());
            faq.setDisplayOrder(maxOrder + 1);
        }

        return repository.save(faq);
    }

    /**
     * Update an existing FAQ
     */
    @Transactional
    @CacheEvict(value = "faqs", allEntries = true)
    public Faq updateFaq(Long id, Faq updates) {
        Faq faq = getFaqById(id);

        if (updates.getCategory() != null) {
            validateCategory(updates.getCategory());
            faq.setCategory(updates.getCategory().toUpperCase());
        }
        if (updates.getQuestion() != null) faq.setQuestion(updates.getQuestion());
        if (updates.getAnswer() != null) faq.setAnswer(updates.getAnswer());
        if (updates.getDisplayOrder() != null) faq.setDisplayOrder(updates.getDisplayOrder());
        if (updates.getActive() != null) faq.setActive(updates.getActive());

        return repository.save(faq);
    }

    /**
     * Delete a FAQ
     */
    @Transactional
    @CacheEvict(value = "faqs", allEntries = true)
    public void deleteFaq(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("FAQ not found");
        }
        repository.deleteById(id);
    }

    /**
     * Get available categories with labels
     */
    public List<Map<String, String>> getCategories() {
        List<Map<String, String>> categories = new ArrayList<>();
        for (String category : Faq.getAllCategories()) {
            Map<String, String> cat = new HashMap<>();
            cat.put("value", category);
            cat.put("label", Faq.getCategoryLabel(category));
            categories.add(cat);
        }
        return categories;
    }

    /**
     * Validate category
     */
    private void validateCategory(String category) {
        if (category == null) return;
        String upperCategory = category.toUpperCase();
        boolean valid = Arrays.asList(Faq.getAllCategories()).contains(upperCategory);
        if (!valid) {
            throw new IllegalArgumentException("Invalid category: " + category +
                ". Valid categories are: " + String.join(", ", Faq.getAllCategories()));
        }
    }

    /**
     * Seed default FAQs
     */
    @Transactional
    @CacheEvict(value = "faqs", allEntries = true)
    public void seedDefaultFaqs() {
        // Only seed if no FAQs exist
        if (repository.count() > 0) {
            return;
        }

        // GENERAL
        createFaqIfNotExists(Faq.CATEGORY_GENERAL, 1,
            "What is Uyirgene?",
            "Uyirgene is a professional training institute specializing in Food Safety, Quality Management, and related fields. We are ISO 9001 certified and a Training Partner of Skill India Digital Hub (Govt of India).");

        createFaqIfNotExists(Faq.CATEGORY_GENERAL, 2,
            "How do I create an account?",
            "Click on the 'Register' button on the top right corner of the website. Fill in your details including name, email, and password. You'll receive a confirmation email to verify your account.");

        createFaqIfNotExists(Faq.CATEGORY_GENERAL, 3,
            "What's the difference between free and paid courses?",
            "Free courses provide basic content and concepts. Paid courses include comprehensive materials, practical assignments, assessments, certificates, and lifetime access to course updates.");

        // COURSES
        createFaqIfNotExists(Faq.CATEGORY_COURSES, 1,
            "How do I enroll in a course?",
            "Browse our course catalog, select a course, and click 'Enroll Now'. For paid courses, complete the payment process. For free courses, you'll get instant access after clicking enroll.");

        createFaqIfNotExists(Faq.CATEGORY_COURSES, 2,
            "Can I access courses on mobile devices?",
            "Yes! Our platform is fully responsive and works on smartphones, tablets, and desktop computers. You can learn anytime, anywhere.");

        createFaqIfNotExists(Faq.CATEGORY_COURSES, 3,
            "How long do I have access to a course?",
            "Once enrolled, you have lifetime access to the course content. You can revisit materials and watch videos as many times as you need.");

        createFaqIfNotExists(Faq.CATEGORY_COURSES, 4,
            "Can I download course materials?",
            "Downloadable resources like PDFs and documents are available for most courses. Video content is available for streaming only to protect intellectual property.");

        // PAYMENTS
        createFaqIfNotExists(Faq.CATEGORY_PAYMENTS, 1,
            "What payment methods do you accept?",
            "We accept all major credit/debit cards, UPI, net banking, and popular wallets through our secure payment gateway powered by Razorpay.");

        createFaqIfNotExists(Faq.CATEGORY_PAYMENTS, 2,
            "Is my payment information secure?",
            "Absolutely! We use Razorpay, a PCI-DSS compliant payment gateway. Your payment details are encrypted and never stored on our servers.");

        createFaqIfNotExists(Faq.CATEGORY_PAYMENTS, 3,
            "What is your refund policy?",
            "We offer a 7-day refund policy for paid courses. If you're unsatisfied with a course, you can request a full refund within 7 days of enrollment, provided you haven't completed more than 30% of the course content.");

        // CERTIFICATES
        createFaqIfNotExists(Faq.CATEGORY_CERTIFICATES, 1,
            "How do I get a certificate?",
            "Complete all course videos and pass the final assessment with the required minimum score. Certificates are automatically generated within 48 hours after result publication.");

        createFaqIfNotExists(Faq.CATEGORY_CERTIFICATES, 2,
            "Are certificates recognized by employers?",
            "Yes! Our certificates are industry-recognized. We are an ISO 9001 certified institute and a Training Partner of Skill India Digital Hub (Govt of India).");

        createFaqIfNotExists(Faq.CATEGORY_CERTIFICATES, 3,
            "How can I verify a certificate?",
            "Each certificate has a unique ID. You can verify any certificate on our website by visiting the Certificate Verification page and entering the certificate ID.");

        // TECHNICAL
        createFaqIfNotExists(Faq.CATEGORY_TECHNICAL, 1,
            "Which browsers are supported?",
            "We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of Chrome or Firefox.");

        createFaqIfNotExists(Faq.CATEGORY_TECHNICAL, 2,
            "Videos are not playing. What should I do?",
            "Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection. If the issue persists, contact our support team.");

        createFaqIfNotExists(Faq.CATEGORY_TECHNICAL, 3,
            "How do I reset my password?",
            "Click on 'Login', then 'Forgot Password'. Enter your registered email address, and we'll send you a password reset link. Follow the link to create a new password.");
    }

    private void createFaqIfNotExists(String category, int order, String question, String answer) {
        repository.save(Faq.builder()
            .category(category)
            .question(question)
            .answer(answer)
            .displayOrder(order)
            .active(true)
            .build());
    }
}
