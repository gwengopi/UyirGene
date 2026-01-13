package com.uyirgene.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterDataRepository extends JpaRepository<MasterData, Long> {

    List<MasterData> findByDataTypeOrderByDisplayOrderAsc(String dataType);

    List<MasterData> findByDataTypeAndActiveTrueOrderByDisplayOrderAsc(String dataType);

    Optional<MasterData> findByDataTypeAndCode(String dataType, String code);

    List<MasterData> findByParentIdOrderByDisplayOrderAsc(Long parentId);

    List<MasterData> findByActiveTrue();

    boolean existsByDataTypeAndCode(String dataType, String code);
}
