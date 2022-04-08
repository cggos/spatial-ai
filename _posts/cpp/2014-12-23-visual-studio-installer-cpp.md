---
layout: article
title:  "Visual Studio Installer 打包 C++ 程序"
tags: Cpp
key: visual-studio-installer-cpp
---

​
本文主要讲解利用VS2010下的Visual Studio Installer打包Zigbee程序（VS2010编写）的过程。

1、打开Zigbee程序，在解决方案中添加“新建项目”-->其他项目类型-->安装和部署-->Visual Studio Installer-->安装项目，命名为ZigbeeInstall。

2、这时在VS2010文件系统中有三个文件夹，如下图所示，“应用程序文件夹”表示要安装的应用程序需要添加的文件；“用户的‘程序’菜单”表示：应用程序安装完，用户的“开始菜单”中的显示的内容，一般在这个文件夹中，需要再创建一个文件夹用来存放：应用程序.exe和卸载程序.exe；“用户桌面”表示：这个应用程序安装完，用户的桌面上的创建的.exe快捷方式。

![](../images/cpp/vs_installer_cpp_01.jpg)


3、右击“应用程序文件夹”-->添加-->“项目输出”，如下图所示。

![](../images/cpp/vs_installer_cpp_02.jpg)

右击“应用程序文件夹”中的“主输出来自Zigbee(活动)”-->“创建 主输出来自Zigbee(活动) 的快捷方式”，重命名为Zigbee，放在“用户的‘程序’菜单”和“用户桌面”文件夹中。

4、右击“应用程序文件夹”-->添加-->“文件夹”或“文件”，添加的文件一般是已经编译过应用程序的debug目录下的文件以及一些附属和说明文件。

5、在“应用程序文件夹”中添加卸载程序（C:Windows\System32\Msiexec.exe），创建其快捷方式，并重命名为“Uninstall”，将其放于“用户的‘程序’菜单”文件夹中；进入ZigbeeInstall项目属性，找到ProductCode，复制其内容，将其粘贴在“Uninstall”快捷方式属性的Argument中，并在其前加/X 选项。

注： msiexec /X {应用程序安装包的ProductCode码}

文件的添加如下图所示：

![](../images/cpp/vs_installer_cpp_03.jpg)


6、为“用户的‘程序’菜单”和“用户桌面”文件夹中的Zigbee快捷方式添加图标：在相应快捷方式的属性的Icon中添加图标（应放于“应用程序文件夹”中）

7、进入ZigbeeInstall项目属性，进行相应的设置，如下图所示：

![](../images/cpp/vs_installer_cpp_04.jpg)


8、点击菜单栏“项目”-->“属性”，打开项目属性对话框，如下图所示：

![](../images/cpp/vs_installer_cpp_05.jpg)


点击“系统必备”，选择相应的安装程序。

9、生成解决方案。

10、双击Debug文件夹中的程序，进行安装。

注：在其他电脑上安装时，只有把Debug文件夹整个都复制过去，才能正常安装，否则就会出现错误。

​
