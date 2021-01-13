---
layout: article
title:  "VirtualBox Note"
tags: VirtualMachine
key: os-virtualbox-note
---

[TOC]

## 增强虚拟磁盘空间容量（VDI)

```sh
# 查看虚拟磁盘空间信息
VBoxManage showhdinfo VirtualBoxVMs/Win10-32/Win10-32.vdi

# 扩展虚拟硬盘空间（这里要扩展到100G(1024*1024*1024*100)，
# 必须是动态分配模式的硬盘不能是固定大小模式的
VBoxManage modifymedium --resize 102400 VirtualBoxVMs/Win10-32/Win10-32.vdi
```

## 共享文件夹

* Host系统为Windows，VM系统为Ubuntu，在Ubuntu下挂载Windows的共享文件夹
  ```sh
  sudo mount -t vboxsf VMShareFolder /mnt/share_folder # VMShareFolder为Windows下在VM中设置的共享文件夹名称
  ```
