---
layout: article
title:  "C#调用WebService获取天气信息"
tags: CSharp
key: csharp-webservice-weather
---
​
# 概述

本文使用C#开发Winform应用程序，通过调用 **<WebXml/>** (http://www.webxml.com.cn) 的 WebService服务 **WeatherWS** 来获取天气预报数据。

本程序所使用的Web服务的URL为：http://ws.webxml.com.cn/WebServices/WeatherWS.asmx，此服务为“2400多个城市天气预报Web服务”。

开发环境说明：

* 系统平台：Windows 7（32bit）；
* 开发工具：VS2010；

# 实现过程

本程序通过“添加Web引用”和“使用WSDL文件”两种方式实现WebService服务的调用。

## 添加Web引用

首先，新建一个WinForm应用程序，在“解决方案管理器”中为该工程添加Web引用：右击工程-->添加服务引用，弹出如下“服务引用设置”对话框：

![](../images/csharp/webservice_weather_01.jpg)　　

点击该对话框“添加Web引用”按钮，弹出“Web引用”对话框，在其中的URL处输入WeatherWS服务地址（http://ws.webxml.com.cn/WebServices/WeatherWS.asmx），点击转到“-->”按钮，修改Web引用名为“WebRefWeather”，如下图所示：
　　
![](../images/csharp/webservice_weather_02.jpg)　　

此时，在需要获取天气信息的地方添加“获取天气核心代码”即可。我是在"按钮响应函数"中添加的，代码如下：

```csharp
WebRefWeather.WeatherWS weather = new WebRefWeather.WeatherWS();
string[] str = new string[32];
try
{
    str = weather.getWeather("北京", "");
    MessageBox.Show(str[0] + "\n" + str[1] + "\n" + str[2] + "\n" + str[4] + "\n" + str[5], "天气信息");
}
catch (Exception ex)
{
    MessageBox.Show(ex.Message);
}
```

程序运行后，点击按钮，即可显示天气信息，如下图所示：

![](../images/csharp/webservice_weather_03.jpg)　　
　　

## 使用WSDL文件

此方法为通过使用VS工具由Web服务URL（http://ws.webxml.com.cn/WebServices/WeatherWS.asmx）或者本地的WeatherWS.asmx文件得到wsdl文件；然后由wsdl文件生成cs文件，即Web服务代理类，最后通过使用此类获取天气数据。即一下几步：

* asmx文件 --> wsdl文件（VS2010工具：disco）；
* wsdl文件 --> cs文件（VS2010工具：wsdl）；

首先，看一下disco工具的帮助，如下图所示：

![](../images/csharp/webservice_weather_04.jpg)　　
　　

通过如下命令，得到wsdl文件：

```dos
disco http://ws.webxml.com.cn/WebServices/WeatherWS.asmx
```

如下图所示：

![](../images/csharp/webservice_weather_05.jpg)　　　

然后，通过wsdl命令由wsdl文件生成cs文件，wsdl命令帮助如下：

![](../images/csharp/webservice_weather_06.jpg)　　　

生成cs文件的命令如下：

```dos
wsdl /l:cs /n:NS_WeatherWS /out:WeatherWS.cs WeatherWS.wsdl
```

即：

![](../images/csharp/webservice_weather_07.jpg)　　
　　

此时，将cs文件加入到新建的Winform工程中，再在按钮的响应函数中加入如下核心代码：

```csharp
NS_WeatherWS.WeatherWS weather = new NS_WeatherWS.WeatherWS();
string[] str = new string[32];
try
{
    str = weather.getWeather("北京", "");
    MessageBox.Show(str[0] + "\n" + str[1] + "\n" + str[2] + "\n" + str[4] + "\n" + str[5], "天气信息");
}
catch (Exception ex)
{
    MessageBox.Show(ex.Message);
}
```

此时，运行程序，会出现如下错误：

> 命名空间“System.Web”中不存在类型或命名空间名称“Services”。是否缺少程序集?

解决办法：在该工程中添加DotNet引用System.Web.Services即可，如下图所示：

![](../images/csharp/webservice_weather_08.jpg)　　　

添加之后，再启动程序，程序即会启动成功。然后，点击按钮，即会像上一个方法一样显示天气信息，如下图所示：

![](../images/csharp/webservice_weather_09.jpg)　　
