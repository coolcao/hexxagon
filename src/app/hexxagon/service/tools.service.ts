import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class Tools {
  // 深度克隆
  deepClone<T>(obj: T): T {
    // 如果是null或者undefined直接返回
    if (obj === null || obj === undefined) {
      return obj;
    }

    // 处理Date对象
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    // 处理数组
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as any;
    }

    // 处理普通对象
    if (typeof obj === 'object') {
      const cloneObj = {} as T;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloneObj[key] = this.deepClone(obj[key]);
        }
      }
      return cloneObj;
    }

    // 处理基本类型
    return obj;
  }
}
