package com.uyirgene.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerService {
    private final CareerRepository repository;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<CareerDto> getAllPublished() {
        return repository.findByPublishedTrueOrderByDisplayOrderAsc().stream()
                .map(CareerDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CareerDto> getAll() {
        return repository.findAllByOrderByDisplayOrderAsc().stream()
                .map(CareerDto::fromEntity)
                .collect(Collectors.toList());
    }

    public CareerDto getById(Long id) {
        Career entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Career not found"));
        return CareerDto.fromEntity(entity);
    }

    public Career getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Career not found"));
    }

    @Transactional
    public CareerDto create(
            String title,
            String subtitle,
            String whyJoinTitle,
            String whyJoinDescription,
            List<String> benefits,
            List<CareerDto.Position> positions,
            Boolean published,
            Integer displayOrder
    ) {
        Career entity = Career.builder()
                .title(title)
                .subtitle(subtitle)
                .whyJoinTitle(whyJoinTitle)
                .whyJoinDescription(whyJoinDescription)
                .benefits(toJson(benefits))
                .positions(toJson(positions))
                .published(published != null ? published : false)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();

        Career saved = repository.save(entity);
        return CareerDto.fromEntity(saved);
    }

    @Transactional
    public CareerDto update(
            Long id,
            String title,
            String subtitle,
            String whyJoinTitle,
            String whyJoinDescription,
            List<String> benefits,
            List<CareerDto.Position> positions,
            Boolean published,
            Integer displayOrder
    ) {
        Career entity = getEntityById(id);

        entity.setTitle(title);
        entity.setSubtitle(subtitle);
        entity.setWhyJoinTitle(whyJoinTitle);
        entity.setWhyJoinDescription(whyJoinDescription);
        entity.setBenefits(toJson(benefits));
        entity.setPositions(toJson(positions));
        entity.setPublished(published != null ? published : entity.getPublished());
        entity.setDisplayOrder(displayOrder != null ? displayOrder : entity.getDisplayOrder());

        Career saved = repository.save(entity);
        return CareerDto.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Career not found");
        }
        repository.deleteById(id);
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
