import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

// 抽烟危害内容数据
const HARMFUL_CONTENTS = [
  {
    id: '1',
    title: '黑肺 vs 正常肺',
    description: '长期吸烟者的肺部会变成黑色，这是烟草中的焦油和毒素沉积的结果。',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
    source: '医学示意图',
  },
  {
    id: '2',
    title: '肺癌病变',
    description: '吸烟是肺癌的主要原因，烟雾中的致癌物质会直接损害肺细胞。',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    source: '医学影像',
  },
  {
    id: '3',
    title: '气管损害',
    description: '烟雾会破坏气管内的纤毛，导致有害物质无法被清除，增加感染风险。',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    source: '医学示意图',
  },
  {
    id: '4',
    title: '牙齿变黄',
    description: '烟草中的尼古丁和焦油会使牙齿变黄变黑，口臭也会随之而来。',
    imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1f136?w=800',
    source: '口腔健康',
  },
  {
    id: '5',
    title: '皮肤老化',
    description: '吸烟会减少皮肤供氧，加速皱纹产生，使皮肤变得暗沉粗糙。',
    imageUrl: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=800',
    source: '皮肤研究',
  },
  {
    id: '6',
    title: '心脏损害',
    description: '吸烟会损伤血管内壁，增加心脏病和中风的风险。',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
    source: '心血管研究',
  },
];

// 警示语录
const WARNING_QUOTES = [
  '每一根烟都在蚕食你的生命',
  '你的肺部正在哭泣，求你放过它们',
  '点燃的不是烟，是你的未来',
  '今天抽的每一根烟，都在向肺癌靠近',
  '想想你的家人，你的健康不只是你自己的',
  '烟瘾是可以克服的，生命只有一次',
  '当你点燃香烟，你点燃的是自己的生命倒计时',
  '研究表明：戒烟后肺部会开始自我修复',
  '你的身体值得更好的对待',
  '每一次戒烟都是对自己生命的尊重',
];

interface HarmfulEffect {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
}

export function FearFactorScreen() {
  const insets = useSafeAreaInsets();
  const [selectedItem, setSelectedItem] = useState<HarmfulEffect | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 随机获取一条警示语
  const getRandomQuote = () => {
    const index = Math.floor(Math.random() * WARNING_QUOTES.length);
    return WARNING_QUOTES[index];
  };

  const [quote] = useState(getRandomQuote());

  const handleItemPress = (item: HarmfulEffect) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING.xxl },
        ]}
      >
        {/* 标题区域 */}
        <View style={styles.header}>
          <Text style={styles.title}>抽烟危害警示</Text>
          <Text style={styles.subtitle}>忍不住想抽烟时看看这些</Text>
        </View>

        {/* 警示语录 */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>⚠️</Text>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>

        {/* 危害内容列表 */}
        <Text style={styles.sectionTitle}>真实案例与危害</Text>
        
        <View style={styles.gridContainer}>
          {HARMFUL_CONTENTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageOverlayText}>点击查看</Text>
                </View>
              </View>
              <Text style={styles.gridItemTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 激励文字 */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>💪 坚持就是胜利</Text>
          <Text style={styles.motivationText}>
            戒烟后，你的身体会发生这些变化：{'\n'}
            • 20分钟后：血压和心率恢复正常{'\n'}
            • 8小时后：血液中一氧化碳开始排出{'\n'}
            • 2周-3个月：肺功能开始改善{'\n'}
            • 1年后：心脏病风险降低50%{'\n'}
            • 10年后：肺癌风险降低50%
          </Text>
        </View>

        {/* 求助信息 */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>需要帮助？</Text>
          <Text style={styles.helpText}>
            如果你感到无法控制烟瘾，建议寻求专业帮助：
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Linking.openURL('tel:12320')}
          >
            <Text style={styles.helpButtonText}>📞 拨打戒烟热线</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 详情弹窗 */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedItem && (
              <>
                <Image
                  source={{ uri: selectedItem.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedItem.description}
                </Text>
                <Text style={styles.modalSource}>来源：{selectedItem.source}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>我明白了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - SPACING.md * 3) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  quoteCard: {
    backgroundColor: COLORS.error + '15',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  quoteIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  quoteText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.error,
    fontWeight: '600',
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: SPACING.md,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  gridItemTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  motivationCard: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  motivationTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  motivationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  helpCard: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  helpTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  helpButton: {
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  helpButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  modalSource: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
