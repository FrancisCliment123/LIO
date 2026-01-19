import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface StarParticle {
  id: number;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  baseOpacity: number;
  layer: number;
  twinkleSpeed?: number;
  twinklePhase?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const StarParticles: React.FC = () => {
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: StarParticle[] = [];
      
      const layerConfigs = [
        { count: 6, sizeRange: [2, 3], speedRange: [0.005, 0.01], opacityRange: [0.2, 0.4] },
        { count: 8, sizeRange: [1.5, 2.5], speedRange: [0.01, 0.02], opacityRange: [0.4, 0.6] },
        { count: 8, sizeRange: [1, 2], speedRange: [0.02, 0.03], opacityRange: [0.6, 0.9] },
        { count: 4, sizeRange: [1, 1.5], speedRange: [0.015, 0.025], opacityRange: [0.5, 0.8] },
      ];

      let particleId = 0;

      layerConfigs.forEach((config, layerIndex) => {
        for (let i = 0; i < config.count; i++) {
          const size = Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0];
          const baseOpacity = Math.random() * (config.opacityRange[1] - config.opacityRange[0]) + config.opacityRange[0];
          const speed = Math.random() * (config.speedRange[1] - config.speedRange[0]) + config.speedRange[0];
          
          const angle = Math.random() * Math.PI * 2;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;

          const hasTwinkle = layerIndex === 3;
          
          newParticles.push({
            id: particleId++,
            size,
            x: Math.random() * SCREEN_WIDTH,
            y: Math.random() * SCREEN_HEIGHT,
            vx,
            vy,
            opacity: baseOpacity,
            baseOpacity,
            layer: layerIndex + 1,
            twinkleSpeed: hasTwinkle ? Math.random() * 0.02 + 0.01 : undefined,
            twinklePhase: hasTwinkle ? Math.random() * Math.PI * 2 : undefined,
          });
        }
      });
      
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  useEffect(() => {
    const animate = () => {
      setParticles((prevParticles) => {
        return prevParticles.map((particle) => {
          let { x, y, vx, vy, opacity, baseOpacity, layer, twinkleSpeed, twinklePhase } = particle;

          const parallaxMultiplier = layer * 0.3;
          x += vx * parallaxMultiplier * 10;
          y += vy * parallaxMultiplier * 10;

          if (x < 0) x = SCREEN_WIDTH;
          if (x > SCREEN_WIDTH) x = 0;
          if (y < 0) y = SCREEN_HEIGHT;
          if (y > SCREEN_HEIGHT) y = 0;

          if (twinkleSpeed !== undefined && twinklePhase !== undefined) {
            const time = Date.now() * twinkleSpeed;
            const twinkle = Math.sin(time + twinklePhase) * 0.3 + 0.7;
            opacity = baseOpacity * twinkle;
          } else {
            opacity = baseOpacity;
          }

          return {
            ...particle,
            x,
            y,
            opacity,
          };
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
              borderRadius: particle.size / 2,
              backgroundColor: `rgba(255, 255, 255, ${particle.opacity})`,
              shadowColor: '#FFFFFF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: particle.opacity * 0.6,
              shadowRadius: particle.size * 2,
              elevation: particle.size,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
  },
  particle: {
    position: 'absolute',
  },
});
