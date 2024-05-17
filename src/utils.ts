export function isEqualObj(obj1, obj2) {
  // 判断类型是否相等
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // 如果是基本类型直接比较值
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  // 获取两个对象的属性名数组
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // 属性数量不相等，返回false
  if (keys1.length !== keys2.length) {
    return false;
  }

  // 比较每个属性的值
  for (let key of keys1) {
    if (!isEqualObj(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}