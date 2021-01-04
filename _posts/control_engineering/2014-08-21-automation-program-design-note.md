---
layout: article
title:  "自动化程序设计"
tags: ControlEngineering
key: control-engineering-automation-program-design-note
---


1. 设计程序之前要理清思路，做好笔记，分好工艺段

2. 标志变量（bool类型）很重要，要给每个工艺段设置必要的标志变量

3. 自动化程序流程：
  * 判断是否是当前工艺
  * 判断当前工艺的执行条件是否具备
  * 判断当前工艺的冲突是否存在
  * 以上全部通过之后执行相应的动作
  * 动作到位检测
  * 超时检测
  * 进行下一段工艺

4. 有时while(true){}、switch(step)--case结构很必要
