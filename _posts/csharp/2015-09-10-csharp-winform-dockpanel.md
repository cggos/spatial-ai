---
layout: article
title:  "C#之Winform窗体DockPanel"
tags: CSharp
key: csharp-winform-dockpanel
---

​WeiFenLuo.WinFormsUI.Docking.dll是开源项目DockPanel Suite的一个类库，可实现像Visual Studio的窗口停靠、拖拽等功能。WeifenLuo.WinFormsUI.Docking是一个很强大的界面布局控件，可以保存自定义的布局为XML文件，可以加载XML配置文件。DockPanel中提供了几个可用的类，重要的有两个：DockPanel和DockContent。DockPanel是从Panel继承出来的，用于为可浮动的dock的子窗口提供进行浮动和dock的场所；DockContent是从Form类中继承出来的，用于提供可浮动的窗口基类。也就是说，DockContent对象可以在DockPanel对象中任意贴边、浮动、TAB化等。

1、新建WinForm窗体

2、修改WinForm窗体属性，设置其为MDI窗体（多文档窗体）

```csharp
this.IsMdiContainer = true;
this.Name = "MainForm";
this.Text = "MainForm";
```

3、为MainForm窗体添加菜单栏

4、解决方案管理器-->添加引用-->浏览-->WeifenLuo.WinFormsUI.Docking.dll

5、工具箱-->选择项...-->.Net Framework组件-->浏览-->WeifenLuo.WinFormsUI.Docking.dll

6、拖动工具箱中的DockPanel控件到MainForm窗体，拖动时如出现如下错误：

![](../images/csharp/winform_dockpanel_01.jpg)
　　

则 项目属性对话框-->应用程序-->目标框架-->.Net Framework 4，即可解决。

当主窗体需要使用工具栏和状态栏时，需要特别注意控件的放置顺序，确保DockPanel控件是最后一个放上去的控件，否则可能出现局部显示效果有误的情况。

7、设置DockPanel控件Dock属性为Fill

```csharp
this.dockPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
```

8、添加两个WinForm窗体，分别为DockPanelFormMain和DockPanelFormSide，在窗体的代码中修改两窗体均继承自DockContent，并修改其FormBorderStyle属性为Fixed3D，设置DockPanelFormMain的BackColor属性为White；

9、在MainForm的Load事件中添加如下代码：

```csharp
DockPanelFormMain dockPanelMain1 = new DockPanelFormMain();
dockPanelMain1.Show(this.dockPanel1);
dockPanelMain1.Text = "MainPanel1";

DockPanelFormMain dockPanelMain2 = new DockPanelFormMain();
dockPanelMain2.Show(this.dockPanel1);
dockPanelMain2.Text = "MainPanel2";

DockPanelFormSide dockPanelSideLeft = new DockPanelFormSide();
dockPanelSideLeft.Show(this.dockPanel1, WeifenLuo.WinFormsUI.Docking.DockState.DockLeft);
dockPanelSideLeft.Text = "DockPanelLeft";

DockPanelFormSide dockPanelSideRight = new DockPanelFormSide();
dockPanelSideRight.Show(this.dockPanel1, WeifenLuo.WinFormsUI.Docking.DockState.DockRight);
dockPanelSideRight.Text = "DockPanelRight";

DockPanelFormSide dockPanelSideBottom = new DockPanelFormSide();
dockPanelSideBottom.Show(this.dockPanel1, WeifenLuo.WinFormsUI.Docking.DockState.DockBottom);
dockPanelSideBottom.Text = "DockPanelBottom";
```

10、程序运行效果如下所示：

![](../images/csharp/winform_dockpanel_02.jpg)

参考链接：DockPanel_2.4 WeifenLuo.WinFormsUI.Docking.dll的用法 - 璇星 - 博客园

DockPanel Suite相关链接：

　　官网：DockPanel Suite - The .NET WinForms Docking Library

　　GitHub：https://github.com/dockpanelsuite

​
