import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// 祝福语音类型
export interface VoiceBlessing {
  id: string;
  speakerName: string;
  filePath: string;
  durationMs: number;
  createdAt: string;
}

const BLESSINGS_DIR = `${FileSystem.documentDirectory}voice_blessings`;

// 初始化音频模式
export const initializeAudio = async (isRecording: boolean): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: isRecording,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
};

// 确保祝福目录存在
const ensureBlessingsDir = async (): Promise<string> => {
  const dirInfo = await FileSystem.getInfoAsync(BLESSINGS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BLESSINGS_DIR, { intermediates: true });
  }
  return BLESSINGS_DIR;
};

// 录制音频
export const recordAudio = async (): Promise<Audio.Recording | null> => {
  try {
    // 请求权限
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      console.error('Microphone permission not granted');
      return null;
    }

    // 初始化录音模式
    await initializeAudio(true);

    // 创建录音
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await recording.startAsync();

    console.log('Recording started');
    return recording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return null;
  }
};

// 停止录制并保存
export const stopRecording = async (
  recording: Audio.Recording,
  speakerName: string
): Promise<VoiceBlessing | null> => {
  console.log('[AudioService] stopRecording 开始, speakerName:', speakerName);
  
  try {
    // 在停止之前获取录音状态（包含时长信息）
    console.log('[AudioService] 获取录音状态...');
    const statusBeforeStop = await recording.getStatusAsync();
    console.log('[AudioService] 录音状态:', JSON.stringify(statusBeforeStop));
    const durationMs = statusBeforeStop.durationMillis || 0;
    console.log('[AudioService] 录音时长:', durationMs, 'ms');

    // 停止录音
    console.log('[AudioService] 停止并卸载录音...');
    await recording.stopAndUnloadAsync();
    
    const uri = recording.getURI();
    console.log('[AudioService] 录音 URI:', uri);
    
    if (!uri) {
      console.error('[AudioService] 录音 URI 为空');
      throw new Error('录音 URI 为空，可能录音未成功开始');
    }

    // 验证源文件是否存在
    console.log('[AudioService] 验证源文件...');
    const sourceFileInfo = await FileSystem.getInfoAsync(uri);
    console.log('[AudioService] 源文件信息:', JSON.stringify(sourceFileInfo));
    
    if (!sourceFileInfo.exists) {
      throw new Error('录音源文件不存在: ' + uri);
    }

    // 确保目录存在
    console.log('[AudioService] 确保目标目录存在...');
    const dirPath = await ensureBlessingsDir();
    console.log('[AudioService] 目标目录:', dirPath);

    // 生成唯一ID
    const timestamp = Date.now();
    const id = `blessing_${timestamp}`;
    const extension = Platform.OS === 'ios' ? 'm4a' : 'mp4';
    const newPath = `${dirPath}/${id}.${extension}`;

    console.log('[AudioService] 目标文件路径:', newPath);

    // 直接复制文件到目标位置
    console.log('[AudioService] 开始复制文件...');
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
      console.log('[AudioService] 文件复制完成');
    } catch (copyError) {
      console.error('[AudioService] 文件复制失败:', copyError);
      throw new Error('文件复制失败: ' + (copyError instanceof Error ? copyError.message : String(copyError)));
    }

    // 验证目标文件
    const targetFileInfo = await FileSystem.getInfoAsync(newPath);
    console.log('[AudioService] 目标文件信息:', JSON.stringify(targetFileInfo));
    
    if (!targetFileInfo.exists) {
      throw new Error('目标文件创建失败');
    }

    const blessing: VoiceBlessing = {
      id,
      speakerName,
      filePath: newPath,
      durationMs,
      createdAt: new Date().toISOString(),
    };

    console.log('[AudioService] Blessing 对象创建成功:', blessing);
    return blessing;
  } catch (error) {
    console.error('[AudioService] stopRecording 失败:', error);
    // 抛出错误而不是返回 null，让调用方知道具体原因
    throw error;
  }
};

// 播放音频
export const playAudio = async (
  filePath: string
): Promise<Audio.Sound | null> => {
  try {
    await initializeAudio(false);

    console.log('Playing audio from:', filePath);
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: filePath },
      { shouldPlay: true }
    );

    return sound;
  } catch (error) {
    console.error('Failed to play audio:', error);
    return null;
  }
};

// 停止播放音频
export const stopAudio = async (sound: Audio.Sound): Promise<void> => {
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch (error) {
    console.error('Failed to stop audio:', error);
  }
};

// 删除祝福语音文件
export const deleteBlessingFile = async (filePath: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete blessing file:', error);
    return false;
  }
};

// 格式化时长
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
