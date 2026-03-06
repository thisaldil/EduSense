import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { OnboardingSlideCard } from "../components/OnboardingSlide";
import { OnboardingSlide, onboardingSlides } from "../data/slides";

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 60 }),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems[0]?.index != null) {
        setIndex(viewableItems[0].index);
      }
    }
  ).current;

  const goNext = () => {
    const next = index + 1;
    if (next < onboardingSlides.length) {
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      // After onboarding, go directly into the Brain Sync calibration intro
      router.replace("/calibration");
    }
  };

  const skip = () => {
    router.replace("/calibration");
  };

  const renderItem: ListRenderItem<OnboardingSlide> = ({ item }) => (
    <OnboardingSlideCard slide={item} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable style={styles.skipButton} onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={onboardingSlides}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {onboardingSlides.map((slide, dotIndex) => {
              const active = dotIndex === index;
              return (
                <View
                  key={slide.key}
                  style={[
                    styles.dot,
                    active ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              );
            })}
          </View>

          <Pressable style={styles.primaryButton} onPress={goNext}>
            <Text style={styles.primaryText}>
              {index === onboardingSlides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  wrapper: {
    flex: 1,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  skipButton: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    ...Typography.label,
    color: Colors.light.textSecondary,
  },
  listContent: {
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 26,
    backgroundColor: Colors.deepBlue,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.light.border,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  primaryText: {
    ...Typography.button,
    color: Colors.light.background,
    letterSpacing: 0.3,
  },
});
