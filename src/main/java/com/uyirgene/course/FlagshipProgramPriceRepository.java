package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlagshipProgramPriceRepository extends JpaRepository<FlagshipProgramPrice, Long> {
    void deleteByFlagshipProgramId(Long flagshipProgramId);
    java.util.Optional<FlagshipProgramPrice> findByFlagshipProgramAndCountryCode(FlagshipProgram program, String countryCode);
}
