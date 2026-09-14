<?php
/**
 * SimplePDF — gerador de PDF mínimo, escrito à mão (sem dependências externas).
 * Suporta apenas texto simples em fonte Helvetica, o suficiente para relatórios
 * tabulares como a "Lista de Usuários" (Desafio Plus 6.1).
 */
class SimplePDF
{
    private array $paginas = [];
    private array $linhasAtual = [];
    private int $margemEsquerda = 42;
    private int $yAtual = 760;
    private int $alturaPagina = 792;
    private int $larguraPagina = 612;

    public function novaPagina(): void
    {
        if (!empty($this->linhasAtual)) {
            $this->paginas[] = $this->linhasAtual;
        }
        $this->linhasAtual = [];
        $this->yAtual = 760;
    }

    public function escreverLinha(string $texto, int $tamanhoFonte = 10, bool $negrito = false): void
    {
        if ($this->yAtual < 60) {
            $this->novaPagina();
        }
        $this->linhasAtual[] = [
            'texto' => $this->escaparTexto($texto),
            'tamanho' => $tamanhoFonte,
            'y' => $this->yAtual,
            'fonte' => $negrito ? 'F2' : 'F1',
        ];
        $this->yAtual -= ($tamanhoFonte + 8);
    }

    public function espaco(int $altura = 10): void
    {
        $this->yAtual -= $altura;
    }

    private function escaparTexto(string $texto): string
    {
        // Remove acentuação para compatibilidade com a StandardEncoding do PDF base.
        $mapa = [
            'á'=>'a','à'=>'a','â'=>'a','ã'=>'a','ä'=>'a','Á'=>'A','À'=>'A','Â'=>'A','Ã'=>'A',
            'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','É'=>'E','È'=>'E','Ê'=>'E',
            'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i','Í'=>'I',
            'ó'=>'o','ò'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','Ó'=>'O','Õ'=>'O','Ô'=>'O',
            'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u','Ú'=>'U',
            'ç'=>'c','Ç'=>'C','ñ'=>'n','Ñ'=>'N',
        ];
        $texto = strtr($texto, $mapa);
        $texto = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $texto);
        return $texto;
    }

    public function saida(): string
    {
        if (!empty($this->linhasAtual)) {
            $this->paginas[] = $this->linhasAtual;
        }
        if (empty($this->paginas)) {
            $this->paginas[] = [];
        }

        $objetos = [];
        $numPaginas = count($this->paginas);

        // 1: Catalog | 2: Pages | 3: Font Helvetica | 4: Font Helvetica-Bold
        $objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";

        $kids = [];
        $proximoId = 5;
        $paginaObjIds = [];
        $conteudoObjIds = [];

        foreach ($this->paginas as $i => $linhas) {
            $paginaObjIds[$i] = $proximoId++;
            $conteudoObjIds[$i] = $proximoId++;
            $kids[] = $paginaObjIds[$i] . ' 0 R';
        }

        $objetos[2] = "<< /Type /Pages /Kids [" . implode(' ', $kids) . "] /Count {$numPaginas} >>";
        $objetos[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
        $objetos[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

        foreach ($this->paginas as $i => $linhas) {
            $pid = $paginaObjIds[$i];
            $cid = $conteudoObjIds[$i];

            $objetos[$pid] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$this->larguraPagina} {$this->alturaPagina}] "
                . "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {$cid} 0 R >>";

            $stream = $this->montarStreamAbsoluto($linhas);

            $objetos[$cid] = "<< /Length " . strlen($stream) . " >>\nstream\n{$stream}\nendstream";
        }

        return $this->montarPDF($objetos, 1);
    }

    private function montarStreamAbsoluto(array $linhas): string
    {
        $stream = "BT\n";
        foreach ($linhas as $linha) {
            $stream .= "/{$linha['fonte']} {$linha['tamanho']} Tf\n";
            $stream .= "1 0 0 1 {$this->margemEsquerda} {$linha['y']} Tm\n";
            $stream .= "({$linha['texto']}) Tj\n";
        }
        $stream .= "ET";
        return $stream;
    }

    private function montarPDF(array $objetos, int $catalogoId): string
    {
        ksort($objetos);
        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        $ids = array_keys($objetos);
        $maxId = max($ids);

        $corpo = '';
        $posicoes = [];
        foreach ($objetos as $id => $conteudo) {
            $posicoes[$id] = strlen($pdf) + strlen($corpo);
            $corpo .= "{$id} 0 obj\n{$conteudo}\nendobj\n";
        }
        $pdf .= $corpo;

        $xrefStart = strlen($pdf);
        $pdf .= "xref\n0 " . ($maxId + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($id = 1; $id <= $maxId; $id++) {
            if (isset($posicoes[$id])) {
                $pdf .= str_pad((string) $posicoes[$id], 10, '0', STR_PAD_LEFT) . " 00000 n \n";
            } else {
                $pdf .= "0000000000 00000 f \n";
            }
        }

        $pdf .= "trailer\n<< /Size " . ($maxId + 1) . " /Root {$catalogoId} 0 R >>\n";
        $pdf .= "startxref\n{$xrefStart}\n%%EOF";

        return $pdf;
    }
}
