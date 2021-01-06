# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv
# Kabsch 算法开始 将预测结构经平移转换之后至最佳结构位置，使得两者之间的rmsd最短
# 提取坐标
def extracting_Coordinates(fileName,flag):
    Arr = []
    Arr_all = []
    if flag=="pre":
        for line in open(fileName + "_Predicted.pdb"):
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
        for line in open(fileName + "_Actual.pdb"):
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
# 计算质心
def calculate_Centroid(P):
    C = P.astype(float).mean(axis=0)
    for i in range(len(C)):
        C[i]=round(C[i],2)
    return C
    # SUMx=0
    # SUMy=0
    # SUMz=0
    # for i in range(len(P)):
    #     SUMx = SUMx + float(P[i][0])
    #     SUMy = SUMy + float(P[i][1])
    #     SUMz = SUMz + float(P[i][2])
    # SUMx = SUMx/len(P)
    # SUMy = SUMy/len(P)
    # SUMz = SUMz/len(P)
    # return [SUMx,SUMy,SUMz]
# 保存为有质心的坐标
def Save_Coordinate(fileName,flag):
    Arr = []
    Arr_all = []
    if flag == "pre":
        for line in open(fileName + "_Predicted.pdb"):
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
        P=numpy.array(Arr_all)
        C=calculate_Centroid(P)
        # print C[0]
        for i in range(len(C)):
            Arr.append(float(C[i]))
        Arr_all.append(Arr)
        return numpy.array(Arr_all)
    else:
        for line in open(fileName + "_Actual.pdb"):
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
        Q = numpy.array(Arr_all)
        C = calculate_Centroid(Q)
        # print C
        for i in range(len(C)):
            Arr.append(float(C[i]))
        Arr_all.append(Arr)
        return numpy.array(Arr_all)
# 平移矩阵
def translate_Matrix(P,centroid):
    # for i in range(len(P)):
    #     if centroid[0]>0:
    #         P[i][0]=P[i][0]-centroid[0]
    #     else:
    #         P[i][0]=P[i][0]+centroid[0]
    #     if centroid[1] > 0:
    #         P[i][1] = P[i][1] - centroid[1]
    #     else:
    #         P[i][1] = P[i][1] + centroid[1]
    #     if centroid[2] > 0:
    #         P[i][2] = P[i][2] - centroid[2]
    #     else:
    #         P[i][2] = P[i][2] + centroid[2]
    # return P
    for i in range(len(P)):
        P[i]=P[i]-centroid
    return P
# 计算最佳旋转矩阵
def Rotate_Matrix(P,Q):
    # 计算协方差矩阵
    H=numpy.dot(numpy.transpose(P),Q)
    # 求H的奇异值分解
    V,S,W=numpy.linalg.svd(H)
    # 计算修正符号
    d = (numpy.linalg.det(V) * numpy.linalg.det(W)) < 0.0
    if d:
        S[-1] = -S[-1]
        V[:, -1] = -V[:, -1]

    # Create Rotation matrix U
    U = numpy.dot(V, W)

    return U
# 计算TM Score
def TMScore(P,Q):
    TM_Score_temp=0
    for i in range(len(P)):
        dis=((P[i][0]-Q[i][0])**2+(P[i][1]-Q[i][1])**2+(P[i][2]-Q[i][2])**2)**0.5
        TM_Score_temp=TM_Score_temp+(1/(1+(dis/(1.24*pow(len(Q)-15,float(1)/float(3)))-1.8)**2))
    TM_Score=TM_Score_temp/len(Q)
    return TM_Score

# 计算RMSD
def rmsd(P,Q):
    diff = numpy.array(P) - numpy.array(Q)
    N = len(P)
    return numpy.sqrt((diff * diff).sum() / N)
# Kabsch 算法结束
# 主函数

# 提取坐标
P=extracting_Coordinates("T0290","pre")
Q=extracting_Coordinates("T0290","acu")
# print len(Q)

# 保存含质心的坐标
# P=Save_Coordinate("T0290","acu")

# 计算质心
centroid_P=calculate_Centroid(P)
centroid_Q=calculate_Centroid(Q)
# print centroid

# 平移结构将质心放在原点
P=translate_Matrix(P,centroid_P)
Q=translate_Matrix(Q,centroid_Q)
# print P

# 计算最佳旋转矩阵
U=Rotate_Matrix(P,Q)

# Rotate P
P = numpy.dot(P, U)
# print P
# print TMScore(P,Q)

# print type(rmsd(P,Q))