package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, Long> {

    Optional<MarketingCampaign> findFirstByStatusIn(List<MarketingCampaign.Status> statuses);

    List<MarketingCampaign> findAllByOrderByCreatedAtDesc();

    Optional<MarketingCampaign> findFirstByStatusOrderByCreatedAtAsc(MarketingCampaign.Status status);
}
