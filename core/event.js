const subs = [];

async function pub(message, params, traceId) {
  const result = {};
  // 处理 before
  {
    const filter = subs.filter((v) => v.message == message + `.before`);
    for (let s of filter) {
      try {
        const ret = await s.run(params);
        if (ret && ret.deny) return { ...ret, success: false };
      } catch (err) {
        // 记录错误
        console.log(s.module);
        console.log(message + `.before`);
        console.log(err);
        return {
          success: false,
          stage: `before`,
          module: s.module,
          error: err,
        };
      }
    }
  }

  // 处理 message
  {
    const filter = subs.filter((v) => v.message == message);
    // 有且仅有一个处理者 如果发现错误 需要记录
    if (filter.length != 1) {
      return {
        success: false,
        stage: `doing`,
        error: `处理者个数为${filter.length},不符合处理者个数要求1个`,
      };
    }
    for (let s of filter) {
      try {
        console.log(params)
        const ret = await s.run(params);
        if (ret && ret.deny) return { ...ret, success: false };
        if (ret && ret.extra) result.extra = ret.extra;
        if (ret && ret.data) result.data = ret.data;
      } catch (err) {
        // 记录错误
        console.log(s.module);
        console.log(message);
        console.log(err);
        return {
          success: false,
          stage: `doing`,
          module: s.module,
          error: err,
        };
      }
    }
  }

  // 处理 after 消息
  {
    const filter = subs.filter((v) => v.message == message + `.after`);
    for (let s of filter) {
      try {
        params.extra = result.extra;
        await s.run(params);
      } catch (err) {
        // 记录错误
        console.log(s.module);
        console.log(message + `.after`);
        console.log(err);
      }
    }
  }

  return {
    success: true,
    data: result.data,
  };
}

function sub(module, message, run) {
  subs.push({ module, message, run });
}

function subBefore(module, message, run) {
  subs.push({ module, message: message + `.before`, run });
}

function subAfter(module, message, run) {
  subs.push({ module, message: message + `.after`, run });
}

module.exports = {
  sub,
  subBefore,
  subAfter,
  pub,
};
