const getData = (type) => {
  const data = [];
  const json = require(`./data/${type}.json`);

  json.map((item) => {
    data.push(item);
  });
  return data;
};

module.exports = {
  getData,
};

/*
文件说明
GA 214.12-2004 常住人口管理信息规范 第12部分 宗教信仰代码 --- religion --- done
GA 240.1-2000 形式犯罪信息管理代码 第1部分：案件类别代码 --- cases --- done
GA 332.2-2001禁毒信息管理代码第2部分：吸毒原因代码 --- drugReason -- done
GA 332.4-2001禁毒信息管理代码第4部分：吸毒后果代码 --- drugResult -- done
GA T 517-2004 常用证件代码 --- certificates --- done
GB 11643-1999 公民身份号码 --- 暂无
GB T 2260-2002 中华人民共和国行政区划代码 --- adminDivi --- done 接口拼装-待检
GB T 2261.1-2003 个人基本信息分类与代码 第1部分：人的性别代码 --- sex --- done
GB T 2261.2-2003 个人基本信息分类与代码 第2部分：婚姻状况代码 --- marriageStatus --- done
GB T 2659-2000 世界各国和地区名称代码◎◎◎ --- world --- done
GB T 3304-1991 中国各民族名称的罗马字母拼写法和代码 --- nations --- done
GB T 4658-2006 学历代码 --- education --- done
GB T 4761-2008 家庭关系代码 --- family --- done
GB T 4762-1984 政治面貌代码 --- face --- done
GB T 6565-2015 职业分类与代码 --- job --- done
GB T 12407-2008 职务级别代码 --- userlevel --- done
*/
