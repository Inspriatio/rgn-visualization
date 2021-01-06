# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv
import io
# 先加载文件里的坐标
def extracting_coordinate(fileName):
    # 先提取坐标
    preArr = []
    preArr_all = []
    actArr = []
    actArr_all = []
    for line in open("D:/wamp64/www/RGN-Model/data/RotatePDB/"+fileName+"/"+fileName+"_BackPredicted.pdb"):
        columns = line.split()
        if (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:15] == "CA"):
            # print columns[2],columns[3],columns[6],columns[7],columns[8]
            preArr.append(float(columns[6]))
            preArr.append(float(columns[7]))
            preArr.append(float(columns[8]))
            if len(preArr) == 3:
                preArr_all.append(preArr)
                preArr = []
    for line in open("D:/wamp64/www/RGN-Model/data/RotatePDB/"+fileName+"/"+fileName+"_BackActual.pdb"):
        columns = line.split()
        if (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:15] == "CA"):
            # print columns[2],columns[3],columns[6],columns[7],columns[8]
            actArr.append(float(columns[6]))
            actArr.append(float(columns[7]))
            actArr.append(float(columns[8]))
            if len(actArr) == 3:
                actArr_all.append(actArr)
                actArr = []
    return (numpy.array(preArr_all)), (numpy.array(actArr_all))
    # return numpy.array(preArr_all)

# 计算对应坐标之间的距离
def distance(P,Q):
    dis = []
    for i in range(len(P)):
        tempDis = ((P[i][0] - Q[i][0])**2 + (P[i][1] - Q[i][1])**2 + (P[i][2] - Q[i][2])**2)**0.5
        tempDis = round(tempDis,3)
        dis.append(tempDis)
    return dis


# 遍历文件夹下所有文件
path="C:/Users/xuyang/Desktop/1/new PDB"
dirs=os.listdir(path)
FName=[]
coordinate1=[]
for file in dirs:
    FName.append(file)
# print (FName)
for b in range(len(FName)):
    os.mkdir('C:/Users/xuyang/Desktop/Dis_Correct/'+FName[b])
for a in range(len(FName)):
    Dis = []
    P, Q = extracting_coordinate(FName[a])
    Dis = distance(P, Q)
    with open("C:/Users/xuyang/Desktop/Dis_Correct/"+FName[a]+"/"+FName[a]+"_dis_correct.json",
              "w") as f:
        json.dump(Dis, f)
    print(FName[a]+" 距离误差加载完成！")