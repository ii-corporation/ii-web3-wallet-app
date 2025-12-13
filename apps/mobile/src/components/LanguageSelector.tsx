import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { useTranslation } from "../hooks/useTranslation";
import type { SupportedLanguage } from "../localization/i18n";

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

interface LanguageItem {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { t, language, setLanguage, getAvailableLanguages } = useTranslation();
  const languages = getAvailableLanguages();

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    onClose();
  };

  const renderLanguageItem = ({ item }: { item: LanguageItem }) => {
    const isSelected = item.code === language;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => handleSelectLanguage(item.code)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.languageInfo}>
          <Text
            style={[
              styles.languageName,
              isSelected && styles.languageNameSelected,
            ]}
          >
            {item.nativeName}
          </Text>
          <Text style={styles.languageSubname}>{item.name}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>\u2713</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t("common.language")}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>\u2715</Text>
              </TouchableOpacity>
            </View>

            {/* Language List */}
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#64748B",
  },
  listContent: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  languageItemSelected: {
    backgroundColor: "#F5F3FF",
  },
  flag: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  languageNameSelected: {
    color: "#7C3AED",
  },
  languageSubname: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LanguageSelector;
