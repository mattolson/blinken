<?php 

DEFINE('COLUMNS', 60);
DEFINE('ROWS', 24);
DEFINE('UNIVERSES', 16);

$file = '';

$rows = 0;
$columns = 0;

$total_points = COLUMNS * ROWS;


class Universe {
	public 	$id,
			$ip = array(),
			$controller,
			$channels

	function IP(){
		return implode('.', $ip);
	}
}

class Pixel {
	public 	$u, $r, $g, $b;
}

class Read_PatchFile {

	private $patchfile,
			$universes,
			$map = array(),
			$filename = "";

	public $errors =0;

	function __construct($filename){
		$this->filename = $filename;
		$this->prepare();
		$this->run();
	}
)

	public getUni($u){
		return $this->universes($u);
	}

	public getPixel($x, $y){
		return $this->map[$x][$y];
	}

	private function run(){
		foreach($this->patchfile as $line) {
			$this->examine($line);
		}
		//Go line by line.
			//Split up each line into an array.
			//Detect which type of line it is.
			//apply data to correct structure
			//repeat ^^

		//display_data
	}

	private function prepare(){
		$this->load_patchfile();
		$this->create_pixels();
		$this->create_universes();
	}

	//Patch
	function load_patchfile(){
		$this->patchfile = file($this->filename, FILE_IGNORE_NEW_LINES);
		//Remove first two lines;
		array_shift( $this->patchfile ); 
		array_shift( $this->patchfile );
	}

	//Setup
	function create_pixels(){
		for($x = 0; $x < COLUMNS; $x++) {
			for($y = 0; $y < ROWS; $y ++) {
				$map[$x][$y] = new Pixel();
			}
		}
	}

	function create_universes(){
		for($u = 0; $u < COLUMNS; $u++) {
			$map[$u] = new Universe();
		}
	}

	function break_apart($line){
		return explode('_', $line);
	}

	function return_patchdata(){
		$res = (object) null;
		$res->universes = $this->universes;
		$res->map = $this->map;
		return $res;
	}


	function examine($l){

		$key = explode('=', $l[count($l)-1])[0];
		$value = explode('=', $l[count($l)-1])[1];

		switch($l[1]){

			case "Num": //Patch_Num_Unis=16

				break;

			case "Uni": //Patch_Uni_ID_11_IP3=1

				$id = $l[3];

				switch($key) {
					case "IP1": $universe[$id]->ip[0] = $value; break;
					case "IP2": $universe[$id]->ip[1] = $value; break;
					case "IP3": $universe[$id]->ip[2] = $value; break;
					case "IP4": $universe[$id]->ip[3] = $value; break;
					case "Nr": 	$universe[$id]->controller = $value; break;
				}
			break;

			case "Pixel":

				$x = $l[3];
				$y = $l[5];

				switch($l[6]){
					case 'Uni':
						if($key == 'ID') $map[$x][$y]->u = $value;
					break;
					case 'Ch':
						$key = strtolower($key);
						$map[$x][$y]->$key = $value;
					break;
				}
				
			break;

			default:
				$this->errors++;

		}
	}
}

class Output_PatchFile {

	public $this->map,
		   $this->universes;

	public $html;

	private $glediator;

	function __construct($filename, $glediator){
		$this->glediator = $glediator;
		$patchdata = $glediator->get_patchdata();
		$this->json_open();

		//Assign vars.
		$this->map = $patchdata->map;
		$this->universes = $patchdata->universes;
	} 

	function display(){
		$this->json_open();
		$this->output_universe();
		$this->output_map();
		$this->json_close();
		echo $this->html;
	}

	private function output_universes(){
		$this->html .= "\t"."universes : ["."\r\n";
		foreach($this->universes as $u) {
			$ip = $u->IP();
			$id = $u->id();
			$channels = 512;
			$this->html .= "\t"."\t".'{ id : '.$id.', ip : "'.$ip.'"}';
			$current++;
			if($current == $total) ? $this->html .= "\r\n" : $this->html .= ','."\r\n";
		}
		$this->html .= "\t"."],"."\r\n";
	}

	private function output_map(){
		$this->html .= "\t"."map : ["."\r\n";
		$total = count($this->map);
		$current = 0;
		foreach($this->map as $p) {
			$u = $p->u;
			$r = $p->r;
			$g = $p->g;
			$b = $p->b;
			$this->html .= "\t"."\t".'{ u : '.$u.', r : '.$r.', g : '.$g.', b : '.$b.' }';
			$current++;
			if($current == $total) ? $this->html .= "\r\n" : $this->html .= ','."\r\n";
			
		}
		$this->html .= "\t"."]"."\r\n";
	}

	private function json_open(){  $this->html .= '[{'."\r\n"; }
	private function json_close(){  $this->html .= ']}'."\r\n"; }

}

//Read and Process the Patchfile (OBSCURE BS)
$glediator = new Read_PatchFile('patch.glediator');

//Output & Save (Not implemented) new Patchfile (JSON)
$blinken = new Output_PatchFile('patch.blinken', $glediator);

//SHOW IT ON THE SCREEN FOR COPY/PASTE
$blinken->display();

//Save to a file (passed as first parameter above "patch.blinken")
// $blinken->save();

?>