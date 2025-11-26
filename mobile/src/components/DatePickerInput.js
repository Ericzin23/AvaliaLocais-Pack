import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import SafeBlurView from './SafeBlurView';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';

export default function DatePickerInput({ value, onChange, error, placeholder = 'Data de nascimento' }) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState({ day: '01', month: '01', year: '2000' });

  React.useEffect(() => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.split('-');
      setTempDate({ day, month, year });
    }
  }, [value]);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const formatDisplayDate = () => {
    if (!value) return null;
    const [year, month, day] = value.split('-');
    const monthName = months.find(m => m.value === month)?.label || month;
    return `${day} de ${monthName} de ${year}`;
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newDate = `${tempDate.year}-${tempDate.month}-${tempDate.day}`;
    onChange(newDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowPicker(true);
        }}
      >
        <SafeBlurView intensity={20} style={styles.blur}>
          <View style={[styles.inputContainer, error && styles.inputError]}>
            <Text style={styles.icon}>📅</Text>
            <Text style={[styles.inputText, !value && styles.placeholder]}>
              {value ? formatDisplayDate() : placeholder}
            </Text>
          </View>
        </SafeBlurView>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleCancel}
          />
          
          <Animatable.View animation="slideInUp" duration={300} style={styles.modalContent}>
            <SafeBlurView intensity={100} style={styles.modalBlur}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione sua data de nascimento</Text>
              </View>

              <View style={styles.pickersContainer}>
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabel}>Dia</Text>
                  <View style={styles.pickerBorder}>
                    <Picker
                      selectedValue={tempDate.day}
                      onValueChange={(val) => setTempDate(prev => ({ ...prev, day: val }))}
                      style={styles.picker}
                    >
                      {days.map(d => <Picker.Item key={d} label={d} value={d} color="#fff" />)}
                    </Picker>
                  </View>
                </View>

                <View style={[styles.pickerWrapper, { flex: 1.5 }]}>
                  <Text style={styles.pickerLabel}>Mês</Text>
                  <View style={styles.pickerBorder}>
                    <Picker
                      selectedValue={tempDate.month}
                      onValueChange={(val) => setTempDate(prev => ({ ...prev, month: val }))}
                      style={styles.picker}
                    >
                      {months.map(m => <Picker.Item key={m.value} label={m.label} value={m.value} color="#fff" />)}
                    </Picker>
                  </View>
                </View>

                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabel}>Ano</Text>
                  <View style={styles.pickerBorder}>
                    <Picker
                      selectedValue={tempDate.year}
                      onValueChange={(val) => setTempDate(prev => ({ ...prev, year: val }))}
                      style={styles.picker}
                    >
                      {years.map(y => <Picker.Item key={y} label={y} value={y} color="#fff" />)}
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </SafeBlurView>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  inputText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  placeholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalBlur: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerBorder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  picker: {
    width: '100%',
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
