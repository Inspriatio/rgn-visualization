# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv
def calculate_GDT(fileName):
    with open('C:/Users/xuyang/Desktop/1/RMSDProcess/'+fileName+'/'+fileName+'_RMSDProcess.json', 'r', encoding='utf8')as fp:
        data = json.load(fp)
        # print(len(data))
        length = len(data)
        GDT1 = 0
        GDT2 = 0
        GDT4 = 0
        GDT8 = 0
        for i in range(len(data)):
            if data[i] <= 2:
                GDT1 = GDT1 + 1
            if data[i] <= 4:
                GDT2 = GDT2 + 1
            if data[i] <= 8:
                GDT4 = GDT4 + 1
            if data[i] <= 12:
                GDT8 = GDT8 + 1
        # print(GDT1,GDT2,GDT4,GDT8)
        GDT_TS = (GDT1/length+GDT2/length+GDT4/length+GDT8/length)*100
        GDT_TS = round(GDT_TS / 4,2)
        return GDT_TS
def calculate_GDT2(fileName):
    with open('C:/Users/xuyang/Desktop/1/Dis_Correct/'+fileName+'/'+fileName+'_dis_correct.json', 'r', encoding='utf8')as fp:
        data = json.load(fp)
        print(data)
        print(len(data))
        length = len(data)
        GDT1 = 0
        GDT2 = 0
        GDT4 = 0
        GDT8 = 0
        for i in range(len(data)):
            if data[i] <= 1:
                GDT1 = GDT1 + 1
            if data[i] <= 2:
                GDT2 = GDT2 + 1
            if data[i] <= 8:
                GDT4 = GDT4 + 1
            if data[i] <= 12:
                GDT8 = GDT8 + 1
        print(GDT1,GDT2,GDT4,GDT8)
        GDT_TS = (GDT1/length+GDT2/length+GDT4/length+GDT8/length)*100
        GDT_TS = round(GDT_TS / 4,2)
        return GDT_TS
# GDT_TS = calculate_GDT("T0315")
# print(GDT_TS)
# 遍历文件夹下所有文件
# path="C:/Users/xuyang/Desktop/1/RMSDProcess"
# dirs=os.listdir(path)
# FName=[]
# coordinate1=[]
# for file in dirs:
#     FName.append(file)
# temp = []
# for a in range(len(FName)):
#
#     GDT_TS = calculate_GDT2(FName[a])

#     temp.append({"FileName": FName[a], "GDT_TS": GDT_TS})
# with open("C:/Users/xuyang/Desktop/GDT_TS.json",
#             "w") as f:
#     json.dump(temp, f, indent=4)



with open('C:/Users/xuyang/Desktop/table.json', 'r', encoding='utf8')as fp1:
    tableData = json.load(fp1)
    with open('C:/Users/xuyang/Desktop/GDT_TS.json', 'r', encoding='utf8')as fp:
        data = json.load(fp)
        myData = []
        for i in range(len(tableData["data"])):
            for j in range(len(data)):
                if(tableData["data"][i]["proteinId"] == data[j]["FileName"]):
                    myData.append({
                        "proteinId":tableData["data"][i]["proteinId"],
                        "classification": tableData["data"][i]["classification"],
                        "length": tableData["data"][i]["length"],
                        "RMSD": tableData["data"][i]["RMSD"],
                        "TM_Score": tableData["data"][i]["TM_Score"],
                        "GDT_TS":data[j]["GDT_TS"]
                    })
with open("C:/Users/xuyang/Desktop/mytable.json",
            "w") as f:
    json.dump(myData, f, indent=4)