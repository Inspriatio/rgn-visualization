# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv
import io

# 提取坐标
def extracting_Coordinates(fileName,flag):
    Arr = []
    Arr_all = []
    if flag=="pre":
        for line in open("D:/wamp64/www/RGN-Model/data/file/" + fileName + "/" + fileName + "_Predicted.pdb"):
            columns = line.split()
            if line[0:4] == "ATOM" and line[21:22] == "A":
                if columns[2] == 'CA':
                    # print columns[2],columns[3],columns[6],columns[7],columns[8]
                    Arr.append(float(columns[6]))
                    Arr.append(float(columns[7]))
                    Arr.append(float(columns[8]))
                    if len(Arr) == 3:
                        Arr_all.append(Arr)
                        Arr = []
        return (numpy.array(Arr_all))
    else:
        for line in open("D:/wamp64/www/RGN-Model/data/file/"+fileName + "/" + fileName + "_Actual.pdb"):
            columns = line.split()
            if line[0:4] == "ATOM" and line[21:22] == "A":
                if columns[2] == 'CA':
                    # print columns[2],columns[3],columns[6],columns[7],columns[8]
                    Arr.append(float(columns[6]))
                    Arr.append(float(columns[7]))
                    Arr.append(float(columns[8]))
                    if len(Arr) == 3:
                        Arr_all.append(Arr)
                        Arr = []
        return (numpy.array(Arr_all))

# 计算RMSD的方法(通过距离矩阵直接计算出评估标准)
def calculate_RMSD(P,Q):
    preDistance=0
    actDistance=0
    temp=[]
    preDistance_ALL=[]
    actDistance_ALL = []
    totalDis=0
    for i in range(len(P)):
        for j in range(len(P)):
            preDistance=(float(P[i][0])-float(P[j][0]))**2+(float(P[i][1])-float(P[j][1]))**2+(float(P[i][2])-float(P[j][2]))**2
            temp.append(preDistance)
        preDistance_ALL.append(temp)
        temp=[]
    for I in range(len(Q)):
        for J in range(len(Q)):
            actDistance = (float(Q[I][0]) - float(Q[J][0])) ** 2 + (float(Q[I][1]) - float(Q[J][1])) ** 2 + (
                        float(Q[I][2]) - float(Q[J][2])) ** 2
            temp.append(actDistance)
        actDistance_ALL.append(temp)
        temp = []
    totalDis = 0
    for i in range(len(preDistance_ALL)):
        for j in range(len(preDistance_ALL)):
            tempDis = preDistance_ALL[i][j] - actDistance_ALL[i][j]
            totalDis = totalDis + tempDis
    rmsd = (abs(totalDis) ** 0.5) / len(preDistance_ALL)
    return rmsd

# p = extracting_Coordinates("T0290","pre")
# q = extracting_Coordinates("T0290","act")
# preTemp = []
# actTemp = []
# RMSD = []
# for i in range(len(p)):
#     preTemp.append(p[i])
#     actTemp.append(q[i])
#     rmsd = calculate_RMSD(preTemp,actTemp)
#     RMSD.append(rmsd)
# print(RMSD)

# 主函数
# 遍历文件夹下所有文件
path="C:/Users/xuyang/Desktop/1/new PDB"
dirs=os.listdir(path)
FName=[]
for file in dirs:
    FName.append(file)
# print (FName)
for b in range(len(FName)):
    os.mkdir('C:/Users/xuyang/Desktop/RMSDProcess/'+FName[b])
for a in range(len(FName)):
    p = extracting_Coordinates(FName[a], "pre")
    q = extracting_Coordinates(FName[a], "act")
    print(p)
    print(q)
    preTemp = []
    actTemp = []
    RMSD = []
    for i in range(len(p)):
        preTemp.append(p[i])
        actTemp.append(q[i])
        rmsd = calculate_RMSD(preTemp, actTemp)
        RMSD.append(rmsd)
    with open("C:/Users/xuyang/Desktop/RMSDProcess/"+FName[a]+"/"+FName[a]+"_RMSDProcess.json",
              "w") as f:
        json.dump(RMSD, f)
    print(FName[a]+" RMSD过程加载完成！")