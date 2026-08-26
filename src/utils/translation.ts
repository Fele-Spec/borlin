import { Language } from '@/types';

const zhToEnDictionary: Record<string, string> = {
  // 问候
  '你好': 'Hello', '再见': 'Goodbye', '早上好': 'Good Morning',
  '晚安': 'Good Night', '欢迎': 'Welcome',
  // 礼貌
  '谢谢': 'Thank you', '感谢': 'Thank you', '对不起': 'Sorry',
  '抱歉': 'Sorry', '请': 'Please',
  // 应答
  '是': 'Yes', '对': 'Yes', '不': 'No', '不是': 'No',
  '好': 'Good', '好的': 'OK',
  // 代词
  '我': 'I', '你': 'You', '他': 'He', '她': 'She',
  '我们': 'We', '咱们': 'We',
  // 疑问
  '什么': 'What', '哪里': 'Where', '哪儿': 'Where',
  '谁': 'Who', '为什么': 'Why', '为啥': 'Why',
  // 动作
  '帮助': 'Help', '帮忙': 'Help', '吃': 'Eat', '吃饭': 'Eat',
  '喝': 'Drink', '喝水': 'Drink', '睡': 'Sleep', '睡觉': 'Sleep',
  '工作': 'Work', '上班': 'Work', '学习': 'Study', '上学': 'Study',
  // 情感
  '爱': 'Love', '喜欢': 'Like', '开心': 'Happy', '高兴': 'Happy',
  '难过': 'Sad', '伤心': 'Sad',
  // 数字
  '一': 'One', '二': 'Two', '三': 'Three', '五': 'Five',
  // 地点
  '家': 'Home', '学校': 'School', '医院': 'Hospital',
  // 名词
  '水': 'Water', '饭': 'Food', '食物': 'Food',
  '朋友': 'Friend', '时间': 'Time', '钱': 'Money',
  // 颜色
  '红': 'Red', '红色': 'Red', '蓝': 'Blue', '蓝色': 'Blue',
  '绿': 'Green', '绿色': 'Green',
  // 能力
  '可以': 'Can', '能': 'Can', '知道': 'Know', '懂': 'Know',
  '想要': 'Want', '想': 'Want', '需要': 'Need', '需': 'Need',
};

const enToZhDictionary: Record<string, string> = {
  // 问候
  'hello': '你好', 'hi': '你好', 'goodbye': '再见', 'bye': '再见',
  'good morning': '早上好', 'good night': '晚安', 'welcome': '欢迎',
  // 礼貌
  'thank you': '谢谢', 'thanks': '谢谢', 'sorry': '对不起', 'please': '请',
  // 应答
  'yes': '是', 'yeah': '是', 'no': '不', 'nope': '不',
  'good': '好', 'great': '好', 'ok': '好的', 'okay': '好的',
  // 代词
  'i': '我', 'me': '我', 'you': '你', 'he': '他', 'she': '她',
  'we': '我们', 'us': '我们',
  // 疑问
  'what': '什么', 'where': '哪里', 'who': '谁', 'why': '为什么',
  // 动作
  'help': '帮助', 'eat': '吃', 'drink': '喝', 'sleep': '睡',
  'work': '工作', 'study': '学习',
  // 情感
  'love': '爱', 'like': '喜欢', 'happy': '开心', 'sad': '难过',
  // 数字
  'one': '一', 'two': '二', 'three': '三', 'five': '五',
  // 地点
  'home': '家', 'house': '家', 'school': '学校', 'hospital': '医院',
  // 名词
  'water': '水', 'food': '饭', 'friend': '朋友', 'friends': '朋友',
  'time': '时间', 'money': '钱',
  // 颜色
  'red': '红', 'blue': '蓝', 'green': '绿',
  // 能力
  'can': '可以', 'know': '知道', 'want': '想要', 'need': '需要',
};

export const translateText = (text: string, from: Language, to: Language): string => {
  if (from === to) return text;

  const normalized = text.toLowerCase().trim();

  if (from === 'zh' && to === 'en') {
    return zhToEnDictionary[normalized] || text;
  }

  if (from === 'en' && to === 'zh') {
    return enToZhDictionary[normalized] || text;
  }

  return text;
};

export const detectLanguage = (text: string): Language => {
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  return hasChinese ? 'zh' : 'en';
};
