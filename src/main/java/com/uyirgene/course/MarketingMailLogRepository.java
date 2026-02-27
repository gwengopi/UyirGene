package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketingMailLogRepository extends JpaRepository<MarketingMailLog, Long> {

    List<MarketingMailLog> findByCampaignAndBatchNumber(MarketingCampaign campaign, int batchNumber);

    long countByCampaignAndStatus(MarketingCampaign campaign, MarketingMailLog.Status status);
}
