let util = {

};
util.title = function (title) {
  title = title || '';
  window.document.title = title + ' 探图网管理系统';
};

util.inOf = function (arr, targetArr) {
  let res = true;
  arr.map(item => {
    if (targetArr.indexOf(item) < 0) {
      res = false;
    }
  });
  return res;
};

util.oneOf = function (ele, targetArr) {
  if (targetArr.indexOf(ele) >= 0) {
    return true;
  } else {
    return false;
  }
};

util.showThisRoute = function (itAccess, currentAccess) {
  if (typeof itAccess === 'object' && itAccess.isArray()) {
    return util.oneOf(currentAccess, itAccess);
  } else {
    return itAccess === currentAccess;
  }
};

util.getPathObjByName = function (vm, name) {
  let pathObj = vm.$store.state.routers.filter((item) => {
    if (item.children.length <= 1) {
      return item.name === name;
    } else {
      let i = 0;
      let childArr = item.children;
      let len = childArr.length;
      while (i < len) {
        if (childArr[i].name === name) {
          return true;
        }
        i++;
      }
      return false;
    }
  })[0];
  return pathObj;
};

util.setCurrentPath = function (vm, name) {
  let title = '';
  vm.$store.state.routers.forEach(item => {
    if (item.children.length === 1) {
      if (item.children[0].name === name) {
        title = item.title;
      }
    } else {
      item.children.forEach(child => {
        if (child.name === name) {
          title = child.title;
        }
      });
    }
  });
  let currentPathArr = [];
  if (name === 'home_index') {
    currentPathArr = [
      {
        title: '首页',
        path: '',
        name: 'home_index'
      }
    ];
  } else if (name.indexOf('_index') >= 0 && name !== 'home_index') {
    currentPathArr = [
      {
        title: '首页',
        path: '/home',
        name: 'home_index'
      },
      {
        title: title,
        path: '',
        name: name
      }
    ];
  } else {
    let currentPathObj = vm.$store.state.routers.filter(item => {
      if (item.children.length <= 1) {
        return item.children[0].name === name;
      } else {
        let i = 0;
        let childArr = item.children;
        let len = childArr.length;
        while (i < len) {
          if (childArr[i].name === name) {
            return true;
          }
          i++;
        }
        return false;
      }
    })[0];
    if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
      currentPathArr = [
        {
          title: '首页',
          path: '',
          name: 'home_index'
        }
      ];
    } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
      currentPathArr = [
        {
          title: '首页',
          path: '/home',
          name: 'home_index'
        },
        {
          title: currentPathObj.title,
          path: '',
          name: name
        }
      ];
    } else {
      let childObj = currentPathObj.children.filter((child) => {
        return child.name === name;
      })[0];
      currentPathArr = [
        {
          title: '首页',
          path: '/home',
          name: 'home_index'
        },
        {
          title: currentPathObj.title,
          path: '',
          name: currentPathObj.name
        },
        {
          title: childObj.title,
          path: currentPathObj.path + '/' + childObj.path,
          name: name
        }
      ];
    }
  }
  vm.$store.commit('setCurrentPath', currentPathArr);

  return currentPathArr;
};

util.openPage = function (vm, name, title) {
  vm.$router.push({
    name: name
  });
  let hasOpened = false;
  vm.pageTagsList.forEach((item, index) => {
    if (item.name === name) {
      hasOpened = true;
      vm.$store.commit('moveToSecond', index);
    }
  });
  if (!hasOpened) {
    vm.$store.commit('increateTag', { name: name, title: title });
  }
};

// 去掉字符串中所有空格(包括中间空格,需要设置第2个参数为:g)。
util.trim = function (str, is_global) {
  var result;
  result = str.replace(/(^\s+)|(\s+$)/g, '');
  if (is_global && is_global.toLowerCase() == 'g') {
    result = result.replace(/\s/g, '');
  }
  return result;
}
// 去掉字符串左边空格
util.trimLeft = function (str) {
  str = String(str);
  return str.replace(/(^\s*)/g, '');
}
// 去掉字符串右边空格
util.trimRight = function (str) {
  str = String(str);
  return str.replace(/(\s*$)/g, '');
}
//无论是空字符串、空整形、空对象都返回true
util.isEmpty = function (obj) {
  var _isEmpty = false;
  if (typeof obj === 'string' || typeof obj === 'number') {
    _isEmpty = !obj;
  } else if (util.isPlainObj(obj)) {
    var value = "";
    for (var i in obj) {
      value += obj[i];
    }
    _isEmpty = !value;
  }

  return _isEmpty;
}

//判断是否是字面量对象
util.isPlainObj = function (obj) {
  return (obj instanceof Object) && (obj.constructor === Object);
}
// 删除空对象
util.deleteEmptyObj = function (obj) {
  if (util.isEmpty(obj)) {
    return {};
  } else if (util.isPlainObj(obj)) {
    for (let i in obj) {
      if (obj[i] === '' || obj[i] === undefined) {
        console.log(i)
        delete obj[i];
      }
    }
    return obj;
  }
}

// 日期格式化为 2017-01-01格式
util.crtTimeFtt = function (val) {
  if (val != null) {
    let date = new Date(val);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    m = m < 10 ? '0' + m : m;
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
  }
}

/**
 * get file extension
 * @param  {String} filename
 * @return {String} file extension
 * @example
 *     input: test.txt
 *     output: txt
 */
util.getFileExtension = function (filename) {
  var tempArr = filename.split(".");
  var ext;
  if (tempArr.length === 1 || (tempArr[0] === "" && tempArr.length === 2)) {
    ext = "";
  } else {
    ext = tempArr.pop().toLowerCase(); //get the extension and make it lower-case
  }
  return ext;
};

export default util;
