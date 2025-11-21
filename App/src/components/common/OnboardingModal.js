import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import styles from '../../styles/OnboardingModal.styles';

const OnboardingModal = ({ visible, onClose = () => {}, steps: customSteps }) => {
  // Default steps, can be overridden via `steps` prop for screen-specific onboarding
  const defaultSteps = [
    {
      title: 'Bienvenido a CodeRoom',
      text: 'Aquí puedes ver y unirte a tus salas activas, iniciar partidas y compartir códigos con tus amigos.',
    },
    {
      title: 'Buscar y Filtrar',
      text: 'Usa el buscador y las pestañas para encontrar salas por código, estado o creador.',
    },
    {
      title: 'Jugar',
      text: 'Entra a una sala y usa el panel de juego para mover piezas y finalizar tu turno.',
    },
  ];

  const steps = Array.isArray(customSteps) && customSteps.length > 0 ? customSteps : defaultSteps;

  const [index, setIndex] = useState(0);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      // Reset values
      scaleAnim.setValue(0.96);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const animateStepChange = (nextIndex) => {
    Animated.sequence([
      Animated.timing(contentOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setIndex(nextIndex);
  };

  const next = () => {
    if (index < steps.length - 1) animateStepChange(index + 1);
    else onClose();
  };

  const prev = () => {
    if (index > 0) animateStepChange(index - 1);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }] }>
          <Animated.View style={{ opacity: contentOpacity }}>
            <Text style={styles.title}>{steps[index].title}</Text>
            <Text style={styles.text}>{steps[index].text}</Text>

            <View style={styles.controlsTopRow}>
              <TouchableOpacity onPress={prev} disabled={index === 0} style={[styles.button, index === 0 && styles.buttonDisabled]}>
                <Text style={styles.buttonText}>Atrás</Text>
              </TouchableOpacity>
              <View style={{flex:1}} />
              <TouchableOpacity onPress={() => onClose()} style={[styles.button, styles.skipButton]}>
                <Text style={styles.buttonText}>Saltar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={next} style={[styles.button, styles.nextButton]}>
                <Text style={styles.buttonText}>{index === steps.length - 1 ? 'Listo' : 'Siguiente'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default OnboardingModal;
