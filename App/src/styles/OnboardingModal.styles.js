import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6F4E37',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 18,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37',
  },
  checkboxMark: {
    color: '#FFF',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#555',
  },
  button: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  skipButton: {
    backgroundColor: '#E6E6E6',
  },
  nextButton: {
    backgroundColor: '#6F4E37',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default styles;
