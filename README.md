# server

docker run -d \
    -p 3001:3001 \
    -p 3002:3002 \
    --restart=always \
    --name punchserver \
registry.cn-beijing.aliyuncs.com/know/punchserver:0.1

-- cc
docker run -d \
    -p 3004:3004 \
    -p 3005:3005 \
    --restart=always \
    --name server \
    -e "NODE_ENV=prod" \
registry-vpc.cn-qingdao.aliyuncs.com/know/enserver:0.1

docker run -d \
    -p 3001:3001 \
    -p 3002:3002 \
    --restart=always \
    --name punchserver \
    -e "NODE_ENV=prod" \
registry.cn-hangzhou.aliyuncs.com/punch/ocserver:0.2

# 服务端开发流程

```plantuml
start
:设计实体;
note right: 设计实体时的要点是要满足查询需求 且方便页面展示;
:设计接口;
note right:1 不要漏接口 根据已经开发的静态页面 \n2 接口路径遵循restful 命名风格 \n3 描述接口出入参数 params query body response
:设计流程;
note right:以plantuml 形式 描述接口处理流程 描述维度要达到伪代码级别
:设计测试用例;
:实现接口;
note right:以TDD编码方式 实现逻辑复杂的接口  
stop
```

# 服务端部署

本地环境部署

连接本地数据库 调用地址改为本机

开发环境部署

将服务部署至 192.168.0.90 调用地址改为开发服务器

生产环境部署

需要先将代码上传至 github 在利用阿里云打包 完成

使用docker 完成生产环境发布

# 测试驱动开发

测试先行

## 测 

单元测试

3A原则 

arrange

act

assert

## 试

红灯 绿灯 重构

## 先

仅编写可过测的代码

## 行

函数级的说明文档

程序入口点



# but

不封装数据库调用层

将数据库地址连接地址改成环境变量

# 整体开发流程

```plantuml
start
:根据模板建立项目;
note right: client server wechat flutter \n 应包含的基础功能 身份认证 泛用接口调用 用户 角色 组织机构 权限 文件服务 主题变色 常用组件
:开发所有静态页面;
note right: 此过程应确认所有的页面设计都是可以实现的 以及需要的数据表
:建库建表;
note right: 按照目前的数据库迁移策略 此过程建立单人完成
:编写发布说明文档;
note right: 除了发布方式外 还有发布环境的相关资源记录
:设计接口;
note right: 在设计接口的过程中 应产出以下文档
:表字段说明文档;
:接口说明;
:开发接口;
note right: 复杂的接口要设计单元测试 以TDD方式开发
:开发界面;
:交互说明文档;
:自测;
:场景测试;
:发布上线;
stop
```

# 数据管理

insert

update 

delete

select

# 查询优化

索引 

视图

查询语句优化

表拆分

存储过程

物理视图

# 物理视图有什么问题？

不稳定

修改数据的节点多 容易出错

结构混乱 每一个方法都承担了 大量同步其他文档的任务

# 一件事情不可能的原因 也是他成立的必要条件

![](test.png)



