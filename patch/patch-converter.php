<?php 

DEFINE('COLUMNS', 60);
DEFINE('ROWS', 24);
DEFINE('UNIVERSES', 16);

$file = '';

$rows = 0;
$columns = 0;

$total_points = COLUMNS * ROWS;


class Universe {
	public 	$c,
			$ch,
			$net,
			$subnet,
			$ip = array();
}

class Pixel {
	public 	$u, $r, $g, $b;
}

class Read_PatchFile {

	private $patchfile,
			$universes,
			$map = array(),
			$meta,
			$filename = "";

	public $errors =0;

	function __construct($filename){
		$this->filename = $filename;
		$this->prepare();
		$this->run();
		// print '<pre>';
		// print_r($this->universes);
		// die();
	}

	public function get_patchdata(){
		$res = (object) null;
		$res->universes = $this->universes;
		$res->map = $this->map;
		$res->meta = $this->meta;
		return $res;
	}

	public function getUni($u){
		return $this->universes[$u];
	}

	public function getPixel($x, $y){
		return $this->map[$x][$y];
	}

	private function run(){

		// echo $this->patchfile[0];

		foreach($this->patchfile as $key => $line) {
			// print($line);
			$this->examine($line);
		}
	}

	private function prepare(){
		$this->load_patchfile();
		$this->create_pixels();
		$this->create_universes();
	}

	//Patch
	private function load_patchfile(){
		// $this->patchfile = file($this->filename, FILE_IGNORE_NEW_LINES);
		//Remove first two lines;
		$handle = fopen($this->filename, "r");
		if ($handle) {
		    while (($line = fgets($handle)) !== false) {
		        $this->patchfile[] = $line;
		    }
		} else {
		    echo "ERROR ERROR! SKY IS FALLING.";
		}	
		array_shift( $this->patchfile ); 
		array_shift( $this->patchfile );
	}

	//Setup
	private function create_pixels(){
		for($x = 0; $x < COLUMNS; $x++) {
			for($y = 0; $y < ROWS; $y ++) {
				$map[$x][$y] = new Pixel();
			}
		}
	}

	private function create_universes(){
		for($u = 0; $u < COLUMNS; $u++) {
			$map[$u] = new Universe();
		}
	}

	private function break_apart($line){
		return explode('_', $line);
	}

	private function examine($_l){
		$l = explode("_", $_l);

		$dd = explode('=', $l[count($l)-1]);
		$key = rtrim($dd[0]);
		$value = rtrim($dd[1]);

		switch($l[1]){

			case "Num": //Patch_Num_Unis=16
				$this->meta = (object) null;
				$this->meta->total_unis = $value;
				$this->meta->source = "Glediator";
				$this->meta->patch_version = "0.1";
				$this->meta->patch_generator = "Blinken";
				$this->meta->author = "Sandwich";
				break;

			case "Uni": //Patch_Uni_ID_11_IP3=1

				$id = $l[3];

				switch($key) {
					case "IP1": $this->universes[$id]->ip[0] = $value; break;
					case "IP2": $this->universes[$id]->ip[1] = $value; break;
					case "IP3": $this->universes[$id]->ip[2] = $value; break;
					case "IP4": $this->universes[$id]->ip[3] = $value; break;
					case "Ch" : if("Num" == $l[4]) $this->universes[$id]->ch = $value;
					case "Nr": 	
						$v = $l[4];
						
						if($v == "Uni") $this->universes[$id]->c = $value; 
						elseif($v == "Net") $this->universes[$id]->net = $value;
						elseif($v == "Sub") $this->universes[$id]->subnet = $value;
						break;
				}
			break;

			case "Pixel":

				$x = $l[3];
				$y = $l[5];

				switch($l[6]){
					case 'Uni':
						if($key == 'ID') $this->map[$x][$y]->u = $value;
					break;
					case 'Ch':
						$key = strtolower($key);
						$this->map[$x][$y]->$key = $value;
					break;
				}
				
			break;

			default:
				$this->errors++;

		}
	}
}

class Output_PatchFile {

	public $meta,
		   $map,
		   $universes;

	public $html;

	private $glediator;

	function __construct($filename, $glediator){
		$this->glediator = $glediator;
		$patchdata = $glediator->get_patchdata();

		//Assign vars.
		$this->meta = $patchdata->meta;
		$this->map = $patchdata->map;
		$this->universes = $patchdata->universes;
	} 

	function display(){
		$this->json_open();
		$this->output_meta();
		$this->output_universes();
		$this->output_map();
		$this->json_close();
		echo $this->html;
	}

	private function output_meta(){
		$this->html .= "\t".'"meta" : '."\r\n";
		$this->html .= "\t"."\t".'{ "total_unis" : '.$this->meta->total_unis.', "pixels_per_uni" : 90,  "source" : "'.$this->meta->source.'", "patch_generator" : "'.$this->meta->patch_generator.'", "patch_version" : "'.$this->meta->patch_version.'", "author" : "'.$this->meta->author.'" },'."\r\n";; 
	}

	private function output_universes(){
		$this->html .= "\t".'"universes" : ['."\r\n";
		$current = 0;
		$total = count($this->universes);
		if(!empty($this->universes)) {
			foreach($this->universes as $u) {
				$ip = rtrim(trim(ip($u->ip)));
				$c = $u->c;
				$this->html .= "\t"."\t".'{ "c" : '.$u->c.',  "ch" : '.$u->ch.', "net" : '.$u->net.', "subnet" : '.$u->subnet.', "ip" : "'.$ip.'"}';
				$current++;
				$this->html .= ($current == $total) ? "\r\n" : ','."\r\n";
			}
		} else {
			$this->html .= '"NO DATA"';
		}
		$this->html .= "\t"."],"."\r\n";
	}

	private function output_map(){
		$this->html .= "\t".'"map" : ['."\r\n";
		
		if(!empty($this->map)) {
			$rowIndex = 0;
			$rowTotal = count($this->map);
			foreach($this->map as $row) { //row = X
				$this->html .= "["."\r\n";
				$colIndex = 0;			 //Reset Column Index
				$colTotal = count($row); //Count total Columns in Row
				foreach($row as $col) { //col = Y
					$u = $col->u;
					$r = $col->r;
					$g = $col->g;
					$b = $col->b;
					$this->html .= "\t"."\t".'{ "u" : '.$u.', "r" : '.$r.', "g" : '.$g.', "b" : '.$b.' }';
					$colIndex++;
					$this->html .= ($colIndex == $colTotal) ? "\r\n" : ','."\r\n";
				}		

				$this->html .= "]"."\r\n";
				$rowIndex++;
				$this->html .= ($rowIndex == $rowTotal) ? "\r\n" : ','."\r\n";

			}
		} else {
			$this->html .= '"NO DATA"';
		}
		$this->html .= "\t"."]"."\r\n";
	}

	private function json_open(){  $this->html .= '[{'."\r\n"; }
	private function json_close(){  $this->html .= '}]'; }
}


// Utilities
function ip($ip){
	return implode('.', $ip);
}

//Read and Process the Patchfile (OBSCURE BS)
$glediator = new Read_PatchFile('patch.glediator');

//Output & Save (Not implemented) new Patchfile (JSON)
$blinken = new Output_PatchFile('patch.blinken', $glediator);

//Set header type as JSON.
header('Content-Type: application/json');

//SHOW IT ON THE SCREEN FOR COPY/PASTE
$blinken->display();

//Save to a file (passed as first parameter above "patch.blinken")
// $blinken->save();

?>