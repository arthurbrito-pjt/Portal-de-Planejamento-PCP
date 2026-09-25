Attribute VB_Name = "EnviarProgIm"
Option Explicit

' =============================================================================
' Envia a aba PROG IM desta planilha diretamente para o Portal de Planejamento
' PCP via API — sem precisar exportar arquivo, enviar e-mail ou fazer upload
' manual na tela do Portal.
'
' INSTALAÇÃO (uma vez, em cada um dos 4 arquivos de programação):
'   1. Abra o VBA Editor (Alt+F11) -> Inserir -> Módulo -> cole este código.
'   2. Ajuste LINHA_PRODUCAO abaixo para o valor certo deste arquivo.
'   3. Cole a chave de API (fornecida pelo TI) em API_KEY.
'   4. Volte pra planilha, insira um botão (Desenvolvedor -> Inserir -> Botão)
'      e atribua a ele a macro "EnviarProgramacaoParaPortal".
'   5. Sempre que a programação for atualizada, clique no botão.
'
' Requer apenas componentes já presentes no Windows (WinHTTP, ADODB) — não
' precisa instalar nada.
' =============================================================================

' TROQUE para o valor certo deste arquivo: "PERFIL_3MM", "PERFIL_475MM",
' "TUBO_MARAFON" ou "TUBO_ZIKELI"
Private Const LINHA_PRODUCAO As String = "PERFIL_3MM"

Private Const API_URL As String = "https://us-central1-slitterpcp.cloudfunctions.net/importProgIm"
Private Const API_KEY As String = "COLE_AQUI_A_CHAVE_FORNECIDA_PELO_TI"

Sub EnviarProgramacaoParaPortal()
    Dim wsProgIm As Worksheet
    Dim ws As Worksheet

    For Each ws In ThisWorkbook.Worksheets
        If NormalizarNome(ws.Name) = "progim" Then
            Set wsProgIm = ws
            Exit For
        End If
    Next ws

    If wsProgIm Is Nothing Then
        MsgBox "Aba PROG IM não encontrada nesta planilha.", vbExclamation, "Envio cancelado"
        Exit Sub
    End If

    Dim lastCol As Long, c As Long
    Dim colItem As Long, colDesc As Long, colQtd As Long
    lastCol = wsProgIm.Cells(1, wsProgIm.Columns.Count).End(xlToLeft).Column
    colItem = 0: colDesc = 0: colQtd = 0

    For c = 1 To lastCol
        Dim h As String
        h = LCase(Trim(CStr(wsProgIm.Cells(1, c).Value)))
        If InStr(h, "item") > 0 Or InStr(h, "cod") > 0 Then colItem = c
        If InStr(h, "descr") > 0 Then colDesc = c
        If InStr(h, "qtd") > 0 Or InStr(h, "quant") > 0 Then colQtd = c
    Next c

    If colItem = 0 Or colQtd = 0 Then
        MsgBox "Não encontrei as colunas Item/Qtd no cabeçalho da aba PROG IM.", vbExclamation, "Envio cancelado"
        Exit Sub
    End If

    Dim lastRow As Long
    lastRow = wsProgIm.Cells(wsProgIm.Rows.Count, colItem).End(xlUp).Row

    Dim itensJson As String, codigo As String, descricao As String, qtdTxt As String
    Dim r As Long, total As Long
    Dim primeiro As Boolean
    primeiro = True
    total = 0

    For r = 2 To lastRow
        codigo = Trim(CStr(wsProgIm.Cells(r, colItem).Value))
        If codigo <> "" Then
            descricao = ""
            If colDesc > 0 Then descricao = CStr(wsProgIm.Cells(r, colDesc).Value)
            qtdTxt = Replace(Trim(CStr(wsProgIm.Cells(r, colQtd).Value)), ",", ".")
            If Not IsNumeric(qtdTxt) Or qtdTxt = "" Then qtdTxt = "0"

            If Not primeiro Then itensJson = itensJson & ","
            itensJson = itensJson & "{""codigo"":""" & EscapeJson(codigo) & """," & _
                        """descricao"":""" & EscapeJson(descricao) & """," & _
                        """qtd"":" & qtdTxt & "}"
            primeiro = False
            total = total + 1
        End If
    Next r

    If total = 0 Then
        MsgBox "Nenhum item encontrado na aba PROG IM.", vbExclamation, "Envio cancelado"
        Exit Sub
    End If

    Dim json As String
    json = "{""linha"":""" & LINHA_PRODUCAO & """,""itens"":[" & itensJson & "]}"

    Application.Cursor = xlWait
    On Error GoTo TratarErro

    Dim http As Object
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open "POST", API_URL, False
    http.SetRequestHeader "Content-Type", "application/json; charset=utf-8"
    http.SetRequestHeader "x-api-key", API_KEY
    http.Send ToUtf8Bytes(json)

    Application.Cursor = xlDefault

    If http.Status = 200 Then
        MsgBox "Programação enviada com sucesso (" & total & " itens processados)." & vbCrLf & vbCrLf & http.ResponseText, vbInformation, "Envio concluído"
    Else
        MsgBox "Erro ao enviar (HTTP " & http.Status & "):" & vbCrLf & http.ResponseText, vbCritical, "Falha no envio"
    End If
    Exit Sub

TratarErro:
    Application.Cursor = xlDefault
    MsgBox "Falha de conexão ao enviar a programação:" & vbCrLf & Err.Description, vbCritical, "Falha no envio"
End Sub

' Remove acentos/pontuação/espaços e coloca em minúsculo, pra casar qualquer
' variação do nome da aba ("prog im", "Prog_IM", "prog, IM"...).
Private Function NormalizarNome(nome As String) As String
    Dim s As String, i As Long, ch As String, resultado As String
    s = LCase(nome)
    s = Replace(s, "á", "a"): s = Replace(s, "ã", "a"): s = Replace(s, "â", "a"): s = Replace(s, "à", "a")
    s = Replace(s, "é", "e"): s = Replace(s, "ê", "e")
    s = Replace(s, "í", "i")
    s = Replace(s, "ó", "o"): s = Replace(s, "õ", "o"): s = Replace(s, "ô", "o")
    s = Replace(s, "ú", "u")
    s = Replace(s, "ç", "c")
    For i = 1 To Len(s)
        ch = Mid(s, i, 1)
        If ch >= "a" And ch <= "z" Then resultado = resultado & ch
    Next i
    NormalizarNome = resultado
End Function

Private Function EscapeJson(s As String) As String
    s = Replace(s, "\", "\\")
    s = Replace(s, """", "\""")
    s = Replace(s, vbCrLf, " ")
    s = Replace(s, vbCr, " ")
    s = Replace(s, vbLf, " ")
    EscapeJson = s
End Function

' Converte a string (UTF-16 interno do VBA) para bytes UTF-8 reais, necessário
' pra acentuação (ç, ã, é...) chegar correta no JSON — WinHttpRequest.Send não
' faz essa conversão sozinho.
Private Function ToUtf8Bytes(s As String) As Byte()
    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2 ' texto
    stream.Charset = "utf-8"
    stream.Open
    stream.WriteText s
    stream.Position = 0
    stream.Type = 1 ' binário
    Dim bytes() As Byte
    bytes = stream.Read
    stream.Close
    ' Remove o BOM (3 bytes) que o ADODB.Stream adiciona no início do UTF-8
    Dim semBom() As Byte
    ReDim semBom(UBound(bytes) - 3)
    Dim i As Long
    For i = 3 To UBound(bytes)
        semBom(i - 3) = bytes(i)
    Next i
    ToUtf8Bytes = semBom
End Function
