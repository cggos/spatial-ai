---
layout: article
title:  "Ubuntu16.04下ARM远程调试环境搭建"
date:   2018-10-18
tags: Embedded
key: ubuntu-arm-remote-debug
---

1. 安装 交叉编译工具 **g++-arm-linux-gnueabi**

   ```sh
   sudo apt install g++-arm-linux-gnueabi
   ```

2. 下载gdb源码：http://ftp.gnu.org/gnu/gdb/，我下载的版本为 **gdb-7.11.1.tar.gz**，解压

3. 安装 交叉编译工具 **arm-linux-gdb**

   ```sh
   cd gdb-7.11.1
   ./configure --target=arm-linux --prefix=/usr/local/arm-gdb
   make
   sudo make install
   ```

   导出环境变量:`export PATH=/usr/local/arm-gdb/bin:$PATH`

4. 编译 **gdbserver**

   ```bash
   cd gdb-7.11.1/gdb/gdbserver
   ./configure --target=arm-linux --host=arm-linux
   make CC=arm-linux-gnueabi-gcc
   ```

   `make` 过程中出现 `sys/reg.h: No such file or directory` 错误时，可注释掉相应源文件中该头文件的包含，再 `make` 即可

   将生成的 **gdbserver** 拷贝至 ARM开发板

5. 远程调试

   * arm端: `gdbserver <pc-ip>:<port> <program>`
   * pc 端: `arm-linux-gdb`，然后 `target remote <arm-ip>:<port>`
