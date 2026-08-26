import { Language } from '@/types';

const zhToEnDictionary: Record<string, string> = {
  // 问候
  '你好': 'Hello', '您好': 'Hello', '再见': 'Goodbye', '拜拜': 'Goodbye',
  '早上好': 'Good Morning', '早安': 'Good Morning', '下午好': 'Good Afternoon',
  '晚安': 'Good Night', '欢迎': 'Welcome', '好久不见': 'Long Time No See',
  '幸会': 'Nice To Meet You', '久仰': 'Nice To Meet You',
  // 礼貌
  '谢谢': 'Thank you', '感谢': 'Thank you', '多谢': 'Thank you',
  '对不起': 'Sorry', '抱歉': 'Sorry', '不好意思': 'Sorry',
  '请': 'Please', '打扰了': 'Excuse me', '打扰': 'Excuse me',
  // 应答
  '是': 'Yes', '对': 'Yes', '是的': 'Yes', '不': 'No', '不是': 'No', '不对': 'No',
  '好': 'Good', '好的': 'OK', '行': 'OK', '也许': 'Maybe', '可能': 'Maybe', '或许': 'Maybe',
  // 代词
  '我': 'I', '自己': 'I', '你': 'You', '您': 'You', '他': 'He', '她': 'She', '它': 'It',
  '我们': 'We', '咱们': 'We', '他们': 'They', '她们': 'They', '它们': 'They',
  '这个': 'This', '这': 'This', '那个': 'That', '那': 'That',
  // 疑问
  '什么': 'What', '啥': 'What', '哪里': 'Where', '哪儿': 'Where', '谁': 'Who',
  '为什么': 'Why', '为啥': 'Why', '为何': 'Why', '怎么': 'How', '怎样': 'How', '如何': 'How',
  '什么时候': 'When', '何时': 'When', '多少': 'How much', '几': 'How much', '哪个': 'Which',
  // 动作
  '帮助': 'Help', '帮忙': 'Help', '帮': 'Help', '吃': 'Eat', '吃饭': 'Eat',
  '喝': 'Drink', '喝水': 'Drink', '睡': 'Sleep', '睡觉': 'Sleep',
  '工作': 'Work', '上班': 'Work', '学习': 'Study', '上学': 'Study',
  '看': 'Look', '看见': 'Look', '听': 'Listen', '听见': 'Listen',
  '说': 'Speak', '说话': 'Speak', '讲': 'Speak', '去': 'Go', '来': 'Come',
  '走': 'Walk', '走路': 'Walk', '跑': 'Run', '跑步': 'Run',
  '买': 'Buy', '购买': 'Buy', '卖': 'Sell', '出售': 'Sell',
  '做': 'Make', '制作': 'Make', '干': 'Make', '用': 'Use', '使用': 'Use',
  '给': 'Give', '给予': 'Give', '拿': 'Take', '取': 'Take',
  '开': 'Open', '打开': 'Open', '关': 'Close', '关闭': 'Close',
  '读': 'Read', '阅读': 'Read', '写': 'Write', '书写': 'Write',
  '玩': 'Play', '玩耍': 'Play', '唱歌': 'Sing', '唱': 'Sing', '跳舞': 'Dance', '舞': 'Dance',
  // 情感
  '爱': 'Love', '喜欢': 'Like', '喜爱': 'Like',
  '开心': 'Happy', '高兴': 'Happy', '快乐': 'Happy',
  '难过': 'Sad', '伤心': 'Sad', '悲伤': 'Sad',
  '生气': 'Angry', '愤怒': 'Angry', '害怕': 'Afraid', '恐惧': 'Afraid', '怕': 'Afraid',
  '惊讶': 'Surprised', '吃惊': 'Surprised', '累': 'Tired', '疲劳': 'Tired', '疲惫': 'Tired',
  '兴奋': 'Excited', '激动': 'Excited', '骄傲': 'Proud', '自豪': 'Proud',
  '害羞': 'Shy', '羞涩': 'Shy',
  // 数字
  '零': 'Zero', '一': 'One', '二': 'Two', '两': 'Two', '三': 'Three',
  '四': 'Four', '五': 'Five', '六': 'Six', '七': 'Seven', '八': 'Eight',
  '九': 'Nine', '十': 'Ten', '百': 'Hundred', '千': 'Thousand',
  // 家人
  '爸爸': 'Father', '父亲': 'Father', '爸': 'Father',
  '妈妈': 'Mother', '母亲': 'Mother', '妈': 'Mother',
  '哥哥': 'Brother', '兄': 'Brother', '姐姐': 'Sister', '姐': 'Sister',
  '爷爷': 'Grandfather', '祖父': 'Grandfather',
  '奶奶': 'Grandmother', '祖母': 'Grandmother',
  '家人': 'Family', '家庭': 'Family', '孩子': 'Child', '小孩': 'Child',
  '宝宝': 'Baby', '婴儿': 'Baby',
  // 食物
  '水': 'Water', '饭': 'Food', '食物': 'Food', '米饭': 'Rice',
  '面包': 'Bread', '牛奶': 'Milk', '苹果': 'Apple', '香蕉': 'Banana',
  '肉': 'Meat', '肉类': 'Meat', '菜': 'Vegetable', '蔬菜': 'Vegetable',
  '鸡蛋': 'Egg', '蛋': 'Egg', '茶': 'Tea', '咖啡': 'Coffee',
  // 动物
  '狗': 'Dog', '小狗': 'Dog', '猫': 'Cat', '小猫': 'Cat',
  '鸟': 'Bird', '小鸟': 'Bird', '鱼': 'Fish', '马': 'Horse',
  '牛': 'Cow', '兔子': 'Rabbit', '兔': 'Rabbit', '老虎': 'Tiger', '虎': 'Tiger',
  // 物品
  '书': 'Book', '书本': 'Book', '笔': 'Pen', '钢笔': 'Pen',
  '手机': 'Phone', '电话': 'Phone', '电脑': 'Computer', '计算机': 'Computer',
  '钥匙': 'Key', '钱': 'Money', '金钱': 'Money', '衣服': 'Clothes', '服装': 'Clothes',
  '鞋子': 'Shoes', '鞋': 'Shoes', '包': 'Bag', '包包': 'Bag',
  '门': 'Door', '窗户': 'Window', '窗': 'Window', '椅子': 'Chair', '椅': 'Chair',
  '桌子': 'Table', '桌': 'Table', '床': 'Bed', '汽车': 'Car', '车': 'Car',
  '公交车': 'Bus', '火车': 'Train', '飞机': 'Plane', '自行车': 'Bike', '单车': 'Bike',
  // 地点
  '家': 'Home', '学校': 'School', '医院': 'Hospital', '商店': 'Shop', '店': 'Shop',
  '餐厅': 'Restaurant', '饭馆': 'Restaurant', '公园': 'Park', '车站': 'Station',
  '图书馆': 'Library', '银行': 'Bank', '办公室': 'Office',
  '厕所': 'Toilet', '卫生间': 'Toilet', '洗手间': 'Toilet',
  // 时间
  '时间': 'Time', '今天': 'Today', '明天': 'Tomorrow', '昨天': 'Yesterday',
  '现在': 'Now', '此刻': 'Now', '早上': 'Morning', '早晨': 'Morning',
  '下午': 'Afternoon', '晚上': 'Evening', '夜晚': 'Evening',
  '星期': 'Week', '周': 'Week', '月': 'Month', '月份': 'Month',
  '年': 'Year', '年份': 'Year',
  // 天气
  '天气': 'Weather', '晴天': 'Sunny', '晴': 'Sunny', '下雨': 'Rainy', '雨': 'Rainy',
  '刮风': 'Windy', '风': 'Windy', '多云': 'Cloudy', '阴': 'Cloudy',
  '下雪': 'Snow', '雪': 'Snow', '热': 'Hot', '冷': 'Cold', '温暖': 'Warm', '暖': 'Warm',
  // 形容词
  '大': 'Big', '小': 'Small', '多': 'Many', '少': 'Few',
  '高': 'Tall', '矮': 'Short', '长': 'Long', '快': 'Fast', '慢': 'Slow',
  '新': 'New', '旧': 'Old', '漂亮': 'Beautiful', '美丽': 'Beautiful', '美': 'Beautiful',
  '丑': 'Ugly', '简单': 'Easy', '容易': 'Easy', '困难': 'Difficult', '难': 'Difficult',
  '重要': 'Important', '有趣': 'Interesting', '有意思': 'Interesting',
  '好吃': 'Delicious', '美味': 'Delicious',
  // 颜色
  '红': 'Red', '红色': 'Red', '蓝': 'Blue', '蓝色': 'Blue',
  '绿': 'Green', '绿色': 'Green', '黄': 'Yellow', '黄色': 'Yellow',
  '黑': 'Black', '黑色': 'Black', '白': 'White', '白色': 'White',
  '粉': 'Pink', '粉色': 'Pink', '紫': 'Purple', '紫色': 'Purple',
  '橙': 'Orange', '橙色': 'Orange',
  // 能力
  '可以': 'Can', '能': 'Can', '能够': 'Can',
  '知道': 'Know', '懂': 'Know', '了解': 'Know',
  '想要': 'Want', '想': 'Think', '要': 'Want',
  '需要': 'Need', '需': 'Need', '思考': 'Think',
  '记得': 'Remember', '记住': 'Remember', '忘记': 'Forget', '忘了': 'Forget',
  '明白': 'Understand', '理解': 'Understand', '懂了': 'Understand',
  '相信': 'Believe', '信任': 'Believe', '希望': 'Hope', '期望': 'Hope',
  // 短语
  '生日快乐': 'Happy Birthday', '新年快乐': 'Happy New Year',
  '祝你好运': 'Good Luck', '好运': 'Good Luck', '保重': 'Take Care',
  '回头见': 'See You Later', '回见': 'See You Later',
  '没问题': 'No Problem', '没事': 'No Problem',
  '小心': 'Be Careful', '注意': 'Be Careful',
  '我爱你': 'I Love You', '非常感谢': 'Thank You Very Much', '十分感谢': 'Thank You Very Much',
  // 职业
  '朋友': 'Friend', '老师': 'Teacher', '教师': 'Teacher',
  '学生': 'Student', '医生': 'Doctor', '大夫': 'Doctor',
  '护士': 'Nurse', '警察': 'Police', '警官': 'Police',
  '工人': 'Worker', '农民': 'Farmer', '农夫': 'Farmer',
  // 身体
  '头': 'Head', '头部': 'Head', '眼睛': 'Eye', '眼': 'Eye',
  '耳朵': 'Ear', '耳': 'Ear', '鼻子': 'Nose', '鼻': 'Nose',
  '嘴巴': 'Mouth', '嘴': 'Mouth', '手': 'Hand', '手部': 'Hand',
  '脚': 'Foot', '足部': 'Foot',
};

const enToZhDictionary: Record<string, string> = {
  // 问候
  'hello': '你好', 'hi': '你好', 'goodbye': '再见', 'bye': '再见',
  'good morning': '早上好', 'good afternoon': '下午好', 'good night': '晚安',
  'welcome': '欢迎', 'long time no see': '好久不见', 'nice to meet you': '幸会',
  // 礼貌
  'thank you': '谢谢', 'thanks': '谢谢', 'thank': '谢谢',
  'sorry': '对不起', 'please': '请', 'excuse me': '打扰了',
  // 应答
  'yes': '是', 'yeah': '是', 'yep': '是', 'no': '不', 'nope': '不',
  'good': '好', 'great': '好', 'nice': '好', 'ok': '好的', 'okay': '好的',
  'maybe': '也许', 'perhaps': '也许',
  // 代词
  'i': '我', 'me': '我', 'myself': '我', 'you': '你', 'yourself': '你',
  'he': '他', 'him': '他', 'she': '她', 'her': '她', 'it': '它',
  'we': '我们', 'us': '我们', 'they': '他们', 'them': '他们',
  'this': '这个', 'that': '那个',
  // 疑问
  'what': '什么', 'where': '哪里', 'who': '谁', 'whom': '谁',
  'why': '为什么', 'how': '怎么', 'when': '什么时候',
  'how much': '多少', 'how many': '多少', 'which': '哪个',
  // 动作
  'help': '帮助', 'eat': '吃', 'drink': '喝', 'sleep': '睡',
  'work': '工作', 'job': '工作', 'study': '学习', 'learn': '学习',
  'look': '看', 'see': '看', 'watch': '看', 'listen': '听', 'hear': '听',
  'speak': '说', 'say': '说', 'talk': '说', 'go': '去', 'come': '来',
  'walk': '走', 'run': '跑', 'buy': '买', 'purchase': '买',
  'sell': '卖', 'sale': '卖', 'make': '做', 'do': '做',
  'use': '用', 'give': '给', 'take': '拿', 'get': '拿',
  'open': '开', 'close': '关', 'shut': '关', 'read': '读',
  'write': '写', 'play': '玩', 'game': '玩', 'sing': '唱歌', 'song': '唱歌',
  'dance': '跳舞',
  // 情感
  'love': '爱', 'like': '喜欢', 'happy': '开心', 'glad': '开心', 'joy': '开心',
  'sad': '难过', 'unhappy': '难过', 'angry': '生气', 'mad': '生气',
  'afraid': '害怕', 'scared': '害怕', 'fear': '害怕',
  'surprised': '惊讶', 'shocked': '惊讶', 'surprise': '惊讶',
  'tired': '累', 'excited': '兴奋', 'exciting': '兴奋',
  'proud': '骄傲', 'shy': '害羞',
  // 数字
  'zero': '零', 'oh': '零', 'one': '一', 'two': '二', 'three': '三',
  'four': '四', 'five': '五', 'six': '六', 'seven': '七', 'eight': '八',
  'nine': '九', 'ten': '十', 'hundred': '百', 'thousand': '千',
  // 家人
  'father': '爸爸', 'dad': '爸爸', 'daddy': '爸爸',
  'mother': '妈妈', 'mom': '妈妈', 'mum': '妈妈',
  'brother': '哥哥', 'bro': '哥哥', 'sister': '姐姐', 'sis': '姐姐',
  'grandfather': '爷爷', 'grandpa': '爷爷',
  'grandmother': '奶奶', 'grandma': '奶奶',
  'family': '家人', 'child': '孩子', 'kid': '孩子', 'children': '孩子',
  'baby': '宝宝', 'infant': '宝宝',
  // 食物
  'water': '水', 'food': '饭', 'rice': '米饭', 'bread': '面包',
  'milk': '牛奶', 'apple': '苹果', 'banana': '香蕉', 'meat': '肉',
  'vegetable': '菜', 'veggie': '菜', 'egg': '鸡蛋', 'tea': '茶', 'coffee': '咖啡',
  // 动物
  'dog': '狗', 'puppy': '狗', 'cat': '猫', 'kitten': '猫',
  'bird': '鸟', 'fish': '鱼', 'horse': '马', 'cow': '牛', 'cattle': '牛',
  'rabbit': '兔子', 'bunny': '兔子', 'tiger': '老虎',
  // 物品
  'book': '书', 'pen': '笔', 'phone': '手机', 'cellphone': '手机', 'mobile': '手机',
  'computer': '电脑', 'pc': '电脑', 'key': '钥匙', 'money': '钱', 'cash': '钱',
  'clothes': '衣服', 'clothing': '衣服', 'shoes': '鞋子', 'shoe': '鞋子',
  'bag': '包', 'door': '门', 'window': '窗户', 'chair': '椅子',
  'table': '桌子', 'desk': '桌子', 'bed': '床', 'car': '汽车', 'automobile': '汽车',
  'bus': '公交车', 'train': '火车', 'plane': '飞机', 'airplane': '飞机',
  'bike': '自行车', 'bicycle': '自行车',
  // 地点
  'home': '家', 'house': '家', 'school': '学校', 'hospital': '医院',
  'shop': '商店', 'store': '商店', 'restaurant': '餐厅', 'park': '公园',
  'station': '车站', 'library': '图书馆', 'bank': '银行', 'office': '办公室',
  'toilet': '厕所', 'restroom': '厕所', 'bathroom': '厕所',
  // 时间
  'time': '时间', 'today': '今天', 'tomorrow': '明天', 'yesterday': '昨天',
  'now': '现在', 'morning': '早上', 'afternoon': '下午',
  'evening': '晚上', 'night': '晚上', 'week': '星期', 'month': '月', 'year': '年',
  // 天气
  'weather': '天气', 'sunny': '晴天', 'sun': '晴天', 'rainy': '下雨', 'rain': '下雨',
  'windy': '刮风', 'wind': '刮风', 'cloudy': '多云', 'cloud': '多云',
  'snow': '下雪', 'snowy': '下雪', 'hot': '热', 'cold': '冷', 'warm': '温暖',
  // 形容词
  'big': '大', 'large': '大', 'small': '小', 'little': '小', 'tiny': '小',
  'many': '多', 'much': '多', 'a lot': '多', 'few': '少',
  'tall': '高', 'high': '高', 'short': '矮', 'low': '矮', 'long': '长',
  'fast': '快', 'quick': '快', 'rapid': '快', 'slow': '慢',
  'new': '新', 'old': '旧', 'beautiful': '漂亮', 'pretty': '漂亮',
  'ugly': '丑', 'easy': '简单', 'simple': '简单', 'difficult': '困难', 'hard': '困难',
  'important': '重要', 'interesting': '有趣', 'fun': '有趣',
  'delicious': '好吃', 'yummy': '好吃', 'tasty': '好吃',
  // 颜色
  'red': '红', 'blue': '蓝', 'green': '绿', 'yellow': '黄',
  'black': '黑', 'white': '白', 'pink': '粉', 'purple': '紫', 'orange': '橙',
  // 能力
  'can': '可以', 'could': '可以', 'able': '可以',
  'know': '知道', 'known': '知道', 'want': '想要', 'wanna': '想要', 'desire': '想要',
  'need': '需要', 'require': '需要', 'think': '想', 'thought': '想',
  'remember': '记得', 'recall': '记得', 'forget': '忘记', 'forgot': '忘记',
  'understand': '明白', 'understood': '明白', 'get it': '明白',
  'believe': '相信', 'trust': '相信', 'hope': '希望', 'wish': '希望',
  // 短语
  'happy birthday': '生日快乐', 'happy new year': '新年快乐',
  'good luck': '祝你好运', 'take care': '保重',
  'see you later': '回头见', 'see you': '回头见',
  'no problem': '没问题', 'no worries': '没问题',
  'be careful': '小心', 'careful': '小心',
  'i love you': '我爱你', 'ily': '我爱你',
  'thank you very much': '非常感谢', 'thanks a lot': '非常感谢',
  // 职业
  'friend': '朋友', 'friends': '朋友', 'teacher': '老师',
  'student': '学生', 'pupil': '学生', 'doctor': '医生', 'physician': '医生',
  'nurse': '护士', 'police': '警察', 'cop': '警察',
  'worker': '工人', 'workman': '工人', 'farmer': '农民', 'peasant': '农民',
  // 身体
  'head': '头', 'eye': '眼睛', 'eyes': '眼睛', 'ear': '耳朵', 'ears': '耳朵',
  'nose': '鼻子', 'mouth': '嘴巴', 'lip': '嘴巴', 'hand': '手', 'hands': '手',
  'foot': '脚', 'feet': '脚', 'leg': '脚',
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
