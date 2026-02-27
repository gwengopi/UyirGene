package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlagshipVideoRepository extends JpaRepository<FlagshipVideo, Long> {

    List<FlagshipVideo> findByProgramIdOrderByOrderIndexAsc(Long programId);

    void deleteByProgramId(Long programId);
}
