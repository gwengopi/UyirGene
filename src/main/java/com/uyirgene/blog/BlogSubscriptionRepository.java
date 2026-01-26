package com.uyirgene.blog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlogSubscriptionRepository extends JpaRepository<BlogSubscription, Long> {

    Optional<BlogSubscription> findByEmail(String email);

    Optional<BlogSubscription> findByUnsubscribeToken(String token);

    List<BlogSubscription> findByActiveTrue();

    boolean existsByEmail(String email);

    long countByActiveTrue();
}
