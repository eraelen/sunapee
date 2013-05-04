

select f.fusername as fu
from isfollowings f
where f.username = 'caleb'

select *
from tweets t, (select f.fusername
from isfollowings f
where f.username = 'caleb') fu
where t.username = fu.fusername