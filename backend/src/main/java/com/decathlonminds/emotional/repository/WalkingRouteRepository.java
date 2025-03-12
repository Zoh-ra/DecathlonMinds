package com.decathlonminds.emotional.repository;

import com.decathlonminds.emotional.model.IntensityLevel;
import com.decathlonminds.emotional.model.WalkingRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WalkingRouteRepository extends JpaRepository<WalkingRoute, UUID> {
    List<WalkingRoute> findByDifficultyLevel(IntensityLevel difficultyLevel);
    List<WalkingRoute> findByDistanceMetersLessThanEqual(Integer maxDistance);
    List<WalkingRoute> findByEstimatedDurationMinutesLessThanEqual(Integer maxDuration);
    List<WalkingRoute> findByRouteType(String routeType);
}
