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
