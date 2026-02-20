package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BundlePriceRepository extends JpaRepository<BundlePrice, Long> {
    Optional<BundlePrice> findByBundleAndCountryCode(CourseBundle bundle, String countryCode);
}
