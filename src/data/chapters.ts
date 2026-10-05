// EXPORTS: IChapter{id,age,year,title,gift,password,image,body,bridge,action,motion}, CHAPTERS
export interface IChapter {
  id: number;
  age: number;
  year: number;
  title: string;
  gift: string;
  password?: string;
  image: string;
  body: string;
  bridge?: boolean;
  action: string;
  motion: string;
}

export const CHAPTERS: IChapter[] = [
  { id:1, age:1, year:2002, title:'给一岁的你', gift:'旺仔牛奶', password:'006', image:'ch01-age01.png', body:'如果那时我在，会把第一口甜甜的快乐递给你。', action:'打开这一岁', motion:'小狗捧着牛奶轻轻摇尾巴' },
  { id:2, age:2, year:2003, title:'给二岁的你', gift:'柔软袜子', password:'020', image:'ch02-age02.png', body:'愿你踩过的每一步，都柔软又暖和。', action:'打开这一岁', motion:'袜子和云朵慢慢晃动' },
  { id:3, age:3, year:2004, title:'给三岁的你', gift:'薯条玩偶', password:'002', image:'ch03-age03.png', body:'把你喜欢的薯条，变成可以抱住的样子。', action:'打开这一岁', motion:'两只小狗闻到薯条香气' },
  { id:4, age:4, year:2005, title:'给四岁的你', gift:'洛克王国拼图', password:'016', image:'ch04-age04.png', body:'一块一块，把小小世界拼完整。', action:'打开这一岁', motion:'拼图块缓缓落到正确位置' },
  { id:5, age:5, year:2006, title:'给五岁的你', gift:'牙刷', password:'025', image:'ch05-age05.png', body:'每天认真刷牙，也认真长大。', action:'打开这一岁', motion:'泡泡在小狗身边浮起来' },
  { id:6, age:6, year:2007, title:'给六岁的你', gift:'布布一二小夜灯', password:'012', image:'ch06-age06.png', body:'小白躺在床上，小鸡毛替你守着一盏灯。', action:'打开这一岁', motion:'夜灯呼吸，小白眨眼，小鸡毛摇尾' },
  { id:7, age:7, year:2008, title:'给七岁的你', gift:'文具小礼盒', password:'009', image:'ch07-age07.png', body:'新的本子，新的铅笔，写下新的故事。', action:'打开这一岁', motion:'丝带慢慢松开，铅笔轻摆' },
  { id:8, age:8, year:2009, title:'给八岁的你', gift:'小狗浴巾浴帽', password:'024', image:'ch08-age08.png', body:'洗完澡钻进柔软里，做一只香香的小狗。', action:'打开这一岁', motion:'水珠落下，小狗从浴巾里探头' },
  { id:9, age:9, year:2010, title:'给九岁的你', gift:'按摩梳', password:'042', image:'ch09-age09.png', body:'累的时候，也要有人替你慢慢梳顺心情。', action:'打开这一岁', motion:'小白轻轻给小鸡毛梳背' },
  { id:10, age:10, year:2011, title:'给十岁的你', gift:'零食包', password:'101', image:'ch10-age10.png', body:'喜欢的零食，就要一起拆开慢慢吃。', action:'打开这一岁', motion:'零食袋晃一晃，两只小狗探头' },
  { id:11, age:11, year:2012, title:'给十一岁的你', gift:'手账本', password:'102', image:'ch11-age11.png', body:'把开心和不开心，都留在属于你的纸页里。', action:'打开这一岁', motion:'手账自动翻开一页' },
  { id:12, age:12, year:2013, title:'给十二岁的你', gift:'本命年红包', password:'011', image:'ch12-age12.png', body:'十二岁的红，替你收好一整年的好运。', action:'打开这一岁', motion:'红包轻摆，福字描边亮起' },
  { id:13, age:13, year:2014, title:'给十三岁的你', gift:'安心小包', password:'018', image:'ch13-age13.png', body:'成长有时会不舒服，但你不用一个人扛。', action:'打开这一岁', motion:'云朵起伏，小白替小鸡毛盖好毯子' },
  { id:14, age:14, year:2015, title:'给十四岁的你', gift:'沐浴露套装', password:'007', image:'ch14-age14.png', body:'洗掉一天的疲惫，留下喜欢的香气。', action:'打开这一岁', motion:'泡泡缓慢上浮，两只小狗眯起眼' },
  { id:15, age:15, year:2016, title:'给十五岁的你', gift:'蒸汽眼罩', password:'005', image:'ch15-age15.png', body:'闭一会儿眼睛，世界也可以等你休息。', action:'打开这一岁', motion:'蒸汽轻飘，拼豆星星慢慢闪' },
  { id:16, age:16, year:2017, title:'给十六岁的你', gift:'润唇膏', password:'015', image:'ch16-age16.png', body:'把细小的照顾，也认真放进每一天。', action:'打开这一岁', motion:'小鸡毛照镜子，小白递来润唇膏' },
  { id:17, age:17, year:2018, title:'给十七岁的你', gift:'充电宝', password:'360', image:'ch17-age17.png', body:'手机要有电，你也要记得给自己充电。', action:'打开这一岁', motion:'电量一格格亮起' },
  { id:18, age:18, year:2019, title:'给十八岁的你', gift:'足金吊坠', password:'324', image:'ch18-age18.png', body:'成年不是突然长大，是开始更坚定地做自己。', action:'打开这一岁', motion:'吊坠轻晃，光沿着轮廓走一圈' },
  { id:19, age:19, year:2020, title:'给十九岁的你', gift:'答案之书', password:'091', image:'ch19-age19.png', body:'没有标准答案也没关系，我们可以一起找。', action:'打开这一岁', motion:'书页翻动后停在这一页' },
  { id:20, age:20, year:2021, title:'给二十岁的你', gift:'刮刮乐', password:'023', image:'ch20-age20.png', body:'愿生活偶尔给你一些意想不到的小惊喜。', action:'打开这一岁', motion:'刮开区一点点显影' },
  { id:21, age:21, year:2022, title:'给二十一岁的你', gift:'沐浴露', password:'100', image:'ch21-age21.png', body:'走向更大的世界，也要好好照顾自己。', action:'打开这一岁', motion:'水珠缓落，泡泡轻晃' },
  { id:22, age:22, year:2023, title:'这一岁，我们相遇了', gift:'相恋记忆桥', image:'ch22-bridge22.png', body:'2023年10月24日。前面的生日是想象，从这里开始，我终于出现在你的故事里。', bridge:true, action:'我记得了，继续', motion:'两只小狗依偎，尾巴轻轻碰到一起' },
  { id:23, age:23, year:2024, title:'这一岁，我们毕业了', gift:'毕业记忆桥', image:'ch23-bridge23.png', body:'穿过校园与夏天，我们把青春认真收进同一张毕业照。', bridge:true, action:'我记得了，继续', motion:'学士帽流苏轻摆，两只小狗相视一笑' },
  { id:24, age:24, year:2025, title:'给二十四岁的你', gift:'薯条兑换券', password:'003', image:'ch24-age24.png', body:'海口让我们第一次没能一起过生日，但距离没有让祝福迟到。', action:'打开这一岁', motion:'票根轻晃，远处的小狗挥爪' },
  { id:25, age:25, year:2026, title:'给二十五岁的你', gift:'照片打印机', password:'004', image:'ch25-age25.png', body:'我在实习，你来了。以后想把我们更多的日子，慢慢打印出来。', action:'打开这一岁', motion:'相纸慢慢吐出，两只小狗蹲在出口等' },
];
