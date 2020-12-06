---
layout: article
title:  "Android Issues 总结"
date:   2020-05-23
tags: Android
key: android-issues-notes
---

[TOC]

-----

* [http://stackoverflow.com/questions/8744994/android-camera-set-resolution](http://stackoverflow.com/questions/8744994/android-camera-set-resolution "Android Camera Set Resolution")
* [http://stackoverflow.com/questions/10913181/camera-preview-is-not-restarting](http://stackoverflow.com/questions/10913181/camera-preview-is-not-restarting "camera preview is not restarting?")
* [http://stackoverflow.com/questions/10913682/how-to-capture-and-save-an-image-using-custom-camera-in-android](http://stackoverflow.com/questions/10913682/how-to-capture-and-save-an-image-using-custom-camera-in-android "How to capture and save an image using custom camera in Android?")
* [http://stackoverflow.com/questions/11121963/how-can-i-set-camera-preview-size-to-squared-aspect-ratio-in-a-squared-surfacevi](http://stackoverflow.com/questions/11121963/how-can-i-set-camera-preview-size-to-squared-aspect-ratio-in-a-squared-surfacevi "How can I set camera preview size to squared aspect ratio in a squared SurfaceView (like Instagram)")

## DateTimePicker Control
* [http://blog.csdn.net/u012246458/article/details/49800271](http://blog.csdn.net/u012246458/article/details/49800271 "日期选择器 - Android自定义DataTimePicker以及日期范围限制")
* [http://blog.csdn.net/csdnadcode/article/details/39555519](http://blog.csdn.net/csdnadcode/article/details/39555519 "Android DatePicker 限制日期选择范围")
* [http://blog.csdn.net/njweiyukun/article/details/50338183](http://blog.csdn.net/njweiyukun/article/details/50338183 "Android中DatePicker只显示年月的方法")

## 自定义对话框
* [http://www.cnblogs.com/weixing/archive/2013/08/14/3257077.html](http://www.cnblogs.com/weixing/archive/2013/08/14/3257077.html "Android自定义对话框(Dialog)位置,大小")
* [http://blog.csdn.net/fancylovejava/article/details/21617553](http://blog.csdn.net/fancylovejava/article/details/21617553 "Android自定义对话框(Dialog)位置,大小")

## How to draw rectangle in XML? ###

We can create a new XML file inside the drawable folder, and add the following code, then save it as rectangle.xml.

	<?xml version="1.0" encoding="utf-8"?>
	<shape xmlns:android="http://schemas.android.com/apk/res/android" >
	    <solid
	        android:color="@android:color/transparent" />
	    <stroke
	        android:width="2dip"
	        android:dashWidth="2dp"   
	        android:dashGap="5dp"    
	        android:color="#ff0000"/>
	</shape>

To use it inside a layout we would set the **android:background** attribute to the new drawable shape,like the following code segment.

	<ImageView
		android:id="@+id/rectimage"
		android:layout_height="100dp"
		android:layout_width="100dp"
		android:src="@drawable/rectangle">
	</ImageView>

finally,have a fun!

**Link:** [http://stackoverflow.com/questions/10124919/can-i-draw-rectangle-in-xml](http://stackoverflow.com/questions/10124919/can-i-draw-rectangle-in-xml "Can I draw rectangle in XML?")

## How to change "shape"(in XML) color dynamically? ###

The "Shape" code in circle2.xml is as like the following segments:

    <?xml version="1.0" encoding="utf-8"?>
	<shape
	    xmlns:android="http://schemas.android.com/apk/res/android"
	    android:id="@+id/shape_circle2"
	    android:shape="oval"
	    android:useLevel="false" >	        
	    <solid
	        android:color="@android:color/transparent" />	    
	    <stroke
	        android:width="1dp"
	        android:color="#00ff00"/>
	    <size
	        android:width="55dp"
	        android:height="55dp"/>    
	</shape>

The code using "Shape" is as follows:

	<ImageView
		android:id="@+id/circle_img"
		android:layout_height="50dp"
		android:layout_width="50dp"
		android:background="@drawable/circle">
	</ImageView>

And we can modify the "Shape" color simply like this:

	ImageView imgviewCircle  = (ImageView)findViewById(R.id.circle_img);
	GradientDrawable backgroundGradient = (GradientDrawable)imgviewCircle.getBackground();
	backgroundGradient.setColor(Color.GREEN);

**Note:** It must be the attribute android:background of ImageView that use the "Shape" as long as we modify the "Shape" color like that!

**Link:** [http://stackoverflow.com/questions/7164630/how-to-change-shape-color-dynamically](http://stackoverflow.com/questions/7164630/how-to-change-shape-color-dynamically "How to change shape color dynamically?")

## Android设置textView水平居中显示

* 让textView里面的内容水平居中：android:gravity="center_horizontal"
* 让textView控件在它的父布局里水平居中：android:layout_gravity="center_horizontal"

## Using lists in Android (ListView) - Tutorial  

**Link:** [http://www.vogella.com/tutorials/AndroidListView/article.html](http://www.vogella.com/tutorials/AndroidListView/article.html)
