<?php
require_once __DIR__ . '/bootstrap.php';
cors();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_out(['error' => 'Method not allowed'], 405);
$projectId = filter_input(INPUT_GET, 'project_id', FILTER_VALIDATE_INT);
if (!$projectId || $projectId < 1) json_out(['error' => 'Valid project_id required'], 400);
$db = db();
$st = $db->prepare('SELECT project_id, exterior_image_url, exterior_width, exterior_height FROM project_explorers WHERE project_id=? AND enabled=1');
$st->bind_param('i', $projectId); $st->execute();
$config = $st->get_result()->fetch_assoc();
if (!$config) json_out(['enabled' => false, 'floors' => [], 'templates' => [], 'unit_templates' => [], 'media' => [], 'assignments' => []]);
function explorer_rows($db, $sql, $id) {
  $s=$db->prepare($sql); $s->bind_param('i',$id); $s->execute();
  return $s->get_result()->fetch_all(MYSQLI_ASSOC);
}
$floors=explorer_rows($db,'SELECT id,floor_number,template_id,label,polygon_json FROM explorer_floors WHERE project_id=? ORDER BY floor_number',$projectId);
$templates=explorer_rows($db,'SELECT id,name,category,floor_plan_url FROM explorer_floor_templates WHERE project_id=? ORDER BY id',$projectId);
$unitTemplates=explorer_rows($db,'SELECT id,floor_template_id,unit_code,label,beds,baths,area,polygon_json FROM explorer_unit_templates WHERE project_id=? ORDER BY id',$projectId);
$media=explorer_rows($db,'SELECT id,unit_template_id,floor_template_id,kind,file_url,sort_order FROM explorer_media WHERE project_id=? ORDER BY sort_order,id',$projectId);
$assignments=explorer_rows($db,'SELECT a.project_unit_id,a.unit_template_id,u.unit_number,u.floor,u.status,u.price,u.currency,u.area,u.beds FROM explorer_unit_assignments a INNER JOIN project_units u ON u.id=a.project_unit_id AND u.project_id=a.project_id WHERE a.project_id=? ORDER BY u.floor,u.unit_number',$projectId);
foreach ($floors as &$floor) $floor['polygon_json']=json_decode($floor['polygon_json'] ?? 'null',true);
unset($floor);
foreach ($unitTemplates as &$unit) $unit['polygon_json']=json_decode($unit['polygon_json'] ?? 'null',true);
unset($unit);
json_out(['enabled'=>true,'config'=>$config,'floors'=>$floors,'templates'=>$templates,'unit_templates'=>$unitTemplates,'media'=>$media,'assignments'=>$assignments]);
