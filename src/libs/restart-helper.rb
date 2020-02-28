pid = ARGV[0].to_i
app_path = ARGV[1]

abort 'Must be given valid pid as first argument' unless pid > 0
abort 'Must be given app path as second argument' unless app_path

def process_is_running(pid)
  begin
    Process.getpgid(pid)
    true
  rescue Errno::ESRCH
    false
  end
end

30.times do
  sleep 2
  unless process_is_running(pid)
    puts "Launching #{app_path}..."
    system("open #{app_path}")
    exit
  end
end

puts "Process with pid #{pid} did not quit."
