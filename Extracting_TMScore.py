# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv
import io
# Kabsch 算法开始 将预测结构经平移转换之后至最佳结构位置，使得两者之间的rmsd最短
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
        print (C[0])
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
        print (C)
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
    L_target=1.24*pow(len(Q)-15,float(1)/float(3))-1.8
    for i in range(len(P)):
        dis=((P[i][0]-Q[i][0])**2+(P[i][1]-Q[i][1])**2+(P[i][2]-Q[i][2])**2)**0.5
        TM_Score_temp=TM_Score_temp+(1/(1+(dis/L_target)**2))
        dis=0
    TM_Score=TM_Score_temp/len(Q)
    return TM_Score

# 计算RMSD 旋转之后求RMSD方法
def rmsd(P,Q):
    diff = numpy.array(P) - numpy.array(Q)
    N = len(P)
    return numpy.sqrt((diff * diff).sum() / N)
# Kabsch 算法结束
# 计算RMSD的第二种方法(通过距离矩阵直接计算出评估标准)
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

# 主函数
# 遍历文件夹下所有文件
path="D:/wamp64/www/RGN-Model/data/file"
dirs=os.listdir(path)
FName=[]
coordinate1=[]
for file in dirs:
    FName.append(file)
# print FName
# # 1. 创建文件对象
# f = io.open('TMScore_Total.csv','wb+')
# # 2. 基于文件对象构建 csv写入对象
# csv_writer = csv.writer(f)
# # 3. 构建列表头
# csv_writer.writerow(["FileName", "TMScore1", "TMScore2"])
temp = []
for a in range(len(FName)):
    # 提取坐标
    P=extracting_Coordinates(FName[a],"pre")
    Q=extracting_Coordinates(FName[a],"acu")
    # print len(Q)
    #直接用原始坐标计算TMScore
    TMScore1=TMScore(P,Q)


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

    TMScore2=TMScore(P,Q)

    # 4. 写入csv文件内容
    # csv_writer.writerow([FName[a],TMScore1,TMScore2])
    print(FName[a]+"TMScore已加载完成！")
    # print(FName[a] + ":法1：" + str(rmsd_method1) + "法2：" + str(rmsd_method2))
    temp.append({"FileName": FName[a], "TMScore1": TMScore1, "TMScore2": TMScore2})
with open("C:/Users/xuyang/Desktop/TMScore.json",
          "w") as f:
    json.dump(temp, f,indent=4)
# 5. 关闭文件
# f.close()

