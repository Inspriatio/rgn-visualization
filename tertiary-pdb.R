library(argparse)
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(seqinr))

tertiary.in = "C:/Users/xuyang/Desktop/1/1sa1/1sa1_Predicted.tertiary"
fasta.in = "C:/Users/xuyang/Desktop/1/1sa1/1sa1.fasta"
pdb.out = "C:/Users/xuyang/Desktop/1/1sa1/1sa1_Predicted.pdb"

# 创建解析器
parser = ArgumentParser(
  description='Convert a tertiary prediction from RGN into a PDB file')

# 整合信息 
parser$add_argument("-t", "--tertiary", default=tertiary.in,
                    help="Coordinates from RGN for protein structure [default \"%(default)s\"]")
parser$add_argument("-f", "--fasta", default=fasta.in,
                    help="Protein sequence in fasta format [default \"%(default)s\"]")
parser$add_argument("-p", "--pdb", default=pdb.out,
                    help="Name of the output pdb formatted coordinates [default \"%(default)s\"]")

# 解析
args = parser$parse_args()
# 设置氨基酸信息参照点
tertiary.in = args$tertiary
fasta.in = args$fasta
pdb.out = args$pdb

aa.codes = c(
  "A" = "Ala",
  "C" = "Cys",
  "D" = "Asp",
  "E" = "Glu",
  "F" = "Phe",
  "G" = "Gly",
  "H" = "His",
  "I" = "Ile",
  "K" = "Lys",
  "L" = "Leu",
  "M" = "Met",
  "N" = "Asn",
  "P" = "Pro",
  "Q" = "Gln",
  "R" = "Arg",
  "S" = "Ser",
  "T" = "Thr",
  "V" = "Val",
  "W" = "Trp",
  "Y" = "Tyr"
) %>% toupper()

# 解析蛋白质序列
seq = read.fasta(fasta.in)

seqlen.fasta = length(getSequence(seq)[[1]])

seq.df = data.frame(
  pos = seq(1, seqlen.fasta, 1),
  seq = toupper(unlist(getSequence(seq))),
  stringsAsFactors = F
) 

# 对结构坐标进行整合
coords = read.csv(
  tertiary.in,
  sep = "",
  comment.char = "#",
  header = F,
  stringsAsFactors = F
)

seqlen.pdb = ncol(coords) / 3

# 判断序列格式
if(seqlen.fasta != seqlen.pdb) 
  stop(sprintf("Sequence length in FASTA (%i) different than in tertiary (%i)", seqlen.fasta, seqlen.pdb))

seqlen = seqlen.fasta

coords.mat = t(coords)

pdb.df = as.data.frame(coords.mat) %>%
  mutate(
    atomr = "ATOM",
    atomid = seq(1, seqlen*3, 1),
    s1n = 7 - ceiling(log10(atomid + 1)),
    atomn = rep(c("  N   ", "  CA  ", "  C   "), seqlen),
    chainid = "A",
    resid = ceiling(atomid / 3),
    s2n = 4 - ceiling(log10(resid + 1)),
    x = round(V1/100, 3),
    y = round(V2/100, 3),
    z = round(V3/100, 3),
    sxn = abs(x),
    sxn = ceiling(log10(sxn)),
    sxn = ifelse(abs(x) <= 1, 1, sxn),
    sxn = 8 - ifelse(x < 0, sxn +1, sxn),
    syn = abs(y),
    syn = ceiling(log10(syn)),
    syn = ifelse(abs(y) <= 1, 1, syn),
    syn = 4 - ifelse(y < 0, syn +1, syn),
    szn = abs(z),
    szn = ceiling(log10(szn)),
    szn = ifelse(abs(z) <= 1, 1, szn),
    szn = 8 - ifelse(z < 0, szn +1, szn),
    occup = "  1.00",
    bfac = "  0.00",
    atomtype = rep(c("N", "C", "C"), seqlen)
  ) 
pdb.resn = merge(pdb.df, seq.df, by.x = "resid", by.y = "pos") %>%
  rowwise() %>%
  mutate(resn = aa.codes[seq])

# 输出PDB格式
pdb.pdbrec = pdb.resn %>%
  rowwise() %>%
  mutate(
    pdbrec = paste0(
      atomr,
      paste0(rep(" ", s1n), collapse = ""),
      atomid,
      atomn,
      resn,
      " ",
      chainid,
      paste0(rep(" ", s2n), collapse = ""),
      resid,
      paste0(rep(" ", sxn), collapse = ""),
      sprintf("%.3f", x),
      paste0(rep(" ", syn), collapse = ""),
      sprintf("%.3f", y),
      paste0(rep(" ", szn), collapse = ""),
      sprintf("%.3f", z),
      occup,
      bfac,
      "           ",
      atomtype,
      "  "
    )
  )
write.table(
  pdb.pdbrec %>% select(pdbrec),
  pdb.out,
  row.names = F,
  col.names = F,
  quote = F
)


