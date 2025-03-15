import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import Colors from "@/constants/Colors";

type ConfirmModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

const ConfirmModal = ({ modalVisible, setModalVisible }: ConfirmModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Thank you for booking with me! I will sms you shortly for confirming
            the appointment!
          </Text>
          <TouchableOpacity
            style={{
              width: 240,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.lightGray,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModalVisible(false)}
          >
            <Text
              style={{
                color: Colors.primary,
                fontWeight: "500",
                fontSize: 16,
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
