---
layout: article
title:  "RAPID 程序设计"
tags: Robotics RAPID 
key: robotics-rapid-programming
---

**1、ABB机器人软件**

RobotWare 是ABB提供的机器人系列应用软件的总称。

RobotStudio是ABB公司自行开发的机器人模拟软件， 能在PC机上模拟几乎所有型号的ABB 机器人几乎所有的操作，它还带有机器人与系统参数配置软件ConfigEdit、离线编程软件ProgramMaker与机器人冷启动软件RobInstall等。通过对CAD 图纸的转换，RobotStudio可以模拟机器人外围设备与夹具， 能够用于配置机器人系统。

RobotStudio创建工作站：新建空工作站-->机器人模型库-->导入模型库-->创建机器人系统-->示教器操作。

**2、ABB机器人编程**

ABB机器人的编程语言是RAPID语言，类似于VB，编程方式类似于组态软件MCGS。

ABB机器人程序框架：

![](../images/robot/rapid_01.png)

![](../images/robot/rapid_02.png)

![](../images/robot/rapid_03.png)


每一个模块表示一种机器人动作或类似动作；执行删除程序命令时，所有系统模块仍将保留，系统模块通常由机器人制造商或生产线建立者编写。例行程序包含一些指令集,它定义了机器人系统实际执行的任务。从控制器程序内存中删除程序时,也会删除所有程序模块。每个程序必须含有名为“main”的例行程序,否则程序将无法执行。

机器人程序储存器中，只允许存在一个主程序；所有例行程序与数据无论存在于哪个模块，全部被系统共享；所有例行程序与数据除特殊定义外，名称必须是唯一的。

USER模块与BASE模块在机器人冷启动后自动生成。

**3、ABB机器人指令**

基本运动指令：MoveL、MoveJ、MoveC

转轴运动指令：MoveAbsJ

通信指令：TPErase、TPWrite

函数：Offs()

fine指机器人TCP达到目标点，并在目标点速度降为零，连续运行时，机器人动作有停顿。zone指机器人TCP不达到目标点，连续运行时，机器人动作圆滑、流畅。