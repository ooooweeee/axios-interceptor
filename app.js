'use strict';

function InterceptorManager() {
  this.handlers = [];
}
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
};
InterceptorManager.prototype.forEach = function forEach(func) {
  for (const value of this.handlers) {
    func(value);
  }
};

function adapter() {
  console.log('adapter');
  return Promise.resolve();
}

function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
Axios.prototype.request = function request(config) {
  let promise = Promise.resolve(config);
  const chain = [];

  this.interceptors.request.forEach(function (interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });
  chain.push(adapter, undefined);
  this.interceptors.response.forEach(function (interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

const axios = new Axios();
axios.interceptors.request.use(
  function (config) {
    console.log('config 1');
    if (config.name === 'ooooweeee') {
      throw new Error('config 1');
    }

    return config;
  },
  function (error) {
    console.log('error 1');
    return Promise.reject(error);
  }
);
axios.interceptors.request.use(
  function (config) {
    console.log('config 2');
    return config;
  },
  function (error) {
    console.log('error 2');
    return Promise.reject(error);
  }
);
axios.interceptors.response.use(
  function (data) {
    console.log('data 3');
    return data;
  },
  function (error) {
    console.log('error 3');
    return Promise.reject(error);
  }
);

axios
  .request({
    name: 'ooooweeee'
  })
  .then(res => {
    console.log('res', res);
  })
  .catch(err => {
    console.error('err', err);
  });
