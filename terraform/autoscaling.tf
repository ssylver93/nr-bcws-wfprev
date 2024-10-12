# auto_scaling.tf

resource "aws_appautoscaling_target" "wfprev_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.wfprev_main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 10
}

resource "aws_appautoscaling_target" "wfprev_nginx_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.nginx.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 10
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfprev_up" {
  name               = "wfprev_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.wfprev_main.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.wfprev_target]
}

resource "aws_appautoscaling_policy" "wfprev_nginx_up" {
  name               = "wfprev_nginx_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.nginx.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.wfprev_nginx_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfprev_down" {
  name               = "wfprev_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.wfprev_main.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.wfprev_target]
}

resource "aws_appautoscaling_policy" "wfprev_nginx_down" {
  name               = "wfprev_nginx_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.nginx.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.wfprev_nginx_target]
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfprev_service_cpu_high" {
  alarm_name          = "wfprev_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfprev_main.name
    ServiceName = aws_ecs_service.wfprev_main.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfprev_up.arn]

  
  tags = {
    Environment = "${var.TARGET_ENV}"
  }
}

resource "aws_cloudwatch_metric_alarm" "wfprev_nginx_service_cpu_high" {
  alarm_name          = "wfprev_nginx_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfprev_main.name
    ServiceName = aws_ecs_service.nginx.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfprev_nginx_up.arn]

 tags = {
    Environment = "${var.TARGET_ENV}"
  }
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfprev_service_cpu_low" {
  alarm_name          = "wfprev_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfprev_main.name
    ServiceName = aws_ecs_service.wfprev_main.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfprev_down.arn]

  tags = {
    Environment = "${var.TARGET_ENV}"
  }
}

resource "aws_cloudwatch_metric_alarm" "wfprev_nginx_service_cpu_low" {
  alarm_name          = "wfprev_nginx_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfprev_main.name
    ServiceName = aws_ecs_service.nginx.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfprev_nginx_down.arn]

  
  tags = {
    Environment = "${var.TARGET_ENV}"
  }
}

resource "aws_appautoscaling_target" "wfprev_client_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.client.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 10
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfprev_client_up" {
  name               = "wfprev_client_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.client.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.wfprev_client_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfprev_client_down" {
  name               = "wfprev_client_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfprev_main.name}/${aws_ecs_service.client.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.wfprev_client_target]
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfprev_client_service_cpu_low" {
  alarm_name          = "wfprev_client_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfprev_main.name
    ServiceName = aws_ecs_service.client.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfprev_client_down.arn]

  tags = {
    Environment = "${var.TARGET_ENV}"
  }
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfprev_client_service_cpu_high" {
  alarm_name          = "wfprev_client_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfprev_main.name
    ServiceName = aws_ecs_service.client.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfprev_client_up.arn]

  tags = {
    Environment = "${var.TARGET_ENV}"
  }
}