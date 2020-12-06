---
layout: article
title:  "Linux平台C++程序调试"
date: 2018-05-01
tags: C++
key: linux-cpp-debug
---

[TOC]

## Overview

* [GNU Binutils](https://www.gnu.org/software/binutils/)

## 定位函数名

建立main.c文件，内容如下：

```c
#include <stdio.h>
void main() {
    int a = 5/0;
}
```

编译 `main.c`：

```sh
gcc -g main.c
```

生成a.out文件

执行 `.\a.out`, 出现如下错误信息：

> Floating point exception (core dumped)

使用 `dmesg | tail` 命令查看：

```sh
[   26.511616] VBoxPciLinuxInit
[   26.701426] vboxpci: IOMMU not found (not registered)
[ 4526.498595] usb 1-5: USB disconnect, device number 2
[ 4526.895918] usb 1-5: new high-speed USB device number 3 using ehci-pci
[ 4527.045378] usb 1-5: New USB device found, idVendor=2717, idProduct=ff48
[ 4527.045381] usb 1-5: New USB device strings: Mfr=1, Product=2, SerialNumber=3
[ 4527.045383] usb 1-5: Product: MI MAX 2
[ 4527.045385] usb 1-5: Manufacturer: Xiaomi
[ 4527.045387] usb 1-5: SerialNumber: 8fc7deed
[31563.822978] traps: a.out[19804] trap divide error ip:4004e5 sp:7ffdd3cf89c0 error:0 in a.out[400000+1000]
```

根据错误地址(ip后面的地址)，使用如下命令，可以定位（输出）函数名：

```sh
addr2line -e a.out 4004e5 -f
```

如下所示：

```sh
main
/home/gordon/main.c:5
```

建立main.cc文件，内容如下：

```cpp
#include <iostream>
using namespace std;
void foo() {
    cout << "the address of foo() is " << (void*)foo << endl;
}
int main() {
    foo();
    return 0;
}
```

编译 `main.cc`：

```
g++ -g main.cc
```

生成a.out文件

执行 `.\a.out`, 输出如下信息：

> the address of foo() is 0x400896

根据输出的函数地址，使用如下命令可以查看函数名：

```sh
addr2line -e a.out 0x400896 -f
```

如下所示：

```sh
_Z3foov
/home/gordon/main.cc:5
```

可以看出C++编译器对函数名进行了编码，我们可以在上一步命令的最后加上 `--demangle=gnu-v3` 选项，输出函数名，如下所示：

```sh
addr2line -e a.out 0x400896 -f --demangle=gnu-v3
```

输出的函数名如下所示：

```sh
foo()
/home/gordon/main.cc:5
```

## Others

* 用gcc编绎该文件
  ```sh
  gcc -c hello.c -o hello.o
  ```

* 生成静态库 用ar工具(ar是archive的意思)，同时可以查看静态库中包含那些.o文件
  ```sh
  ar cqs libhello.a hello.o

  ar -t libname.a # 查看一个静态库由那些.o文件
  ```

* 生成动态库 用gcc来完成，由于可能存在多个版本，因此通常指定版本号
  ```sh
  gcc -shared -o libhello.so.1.0 hello.o
  ```

* **在Linux下，动态库和静态库同事存在时，gcc/g++的链接程序，默认链接的动态库**
* To link your program with lib1, lib3 dynamically and lib2 statically, use such gcc call:
  ```sh
  gcc program.o -llib1 -Wl,-Bstatic -llib2 -Wl,-Bdynamic -llib3
  ```

* 使用ldd工具，查看可执行程序依赖那些动态库或着动态库依赖于那些动态库
  ```sh
  ldd /bin/lnlibc.so.6
  ```

* 使用nm工具，查看静态库和动态库中有那些函数名
  ```sh
  nm libhello.so
  ```

* 如何查看动态库和静态库是32位，还是64位下的库
  ```sh
  file *.so  # 动态库

  objdump -x *.a  # 静态
  ```

* LIBRARY_PATH环境变量：指定程序静态链接库文件搜索路径
* LD_LIBRARY_PATH环境变量：指定程序动态链接库文件搜索路径

* 比如我们有一个基础库libbase.a,还有一个依赖libbase.a编译的库，叫做libchild.a；在我们编译程序时，一定要先-lchild再-lbase。 如果使用 -lbase -lchild，在编译时将出现一些函数undefined，而这些函数实际上已经在base中已经定义；
