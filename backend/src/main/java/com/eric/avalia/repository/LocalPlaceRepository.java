package com.eric.avalia.repository;

import com.eric.avalia.entity.LocalPlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocalPlaceRepository extends JpaRepository<LocalPlace, Long> {
    Optional<LocalPlace> findByGooglePlaceId(String placeId);
}
